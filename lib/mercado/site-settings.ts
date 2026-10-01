/**
 * Config global del directorio (singleton mercado_site_settings).
 * Lectura/escritura vía service role en Next.js.
 */

import { z } from 'zod'
import { createAdminClient } from '../supabase/admin'
import { logger } from '../logger'
import {
  MERCADO_MARKET_HOURS,
  type MarketDayHours,
  type MarketDayKey,
} from './market-hours'
import { MERCADO_DIRECTORY_WHATSAPP } from './whatsapp'

export const SITE_SETTINGS_TABLE = 'mercado_site_settings'
export const SITE_SETTINGS_ROW_ID = 1

export type HoursOverride = Partial<
  Record<MarketDayKey, { openMin: number; closeMin: number; display: string }>
>

export type MercadoSiteSettings = {
  forceClosed: boolean
  supportWhatsapp: string
  hoursOverride: HoursOverride | null
  updatedAt: string | null
  updatedBy: string | null
}

export type MercadoSitePublic = {
  forceClosed: boolean
  supportWhatsapp: string
  hoursRows: Array<{ days: string; hours: string }>
  hours: Record<MarketDayKey, MarketDayHours>
}

const dayOverrideSchema = z.object({
  openMin: z.number().int().min(0).max(24 * 60 - 1),
  closeMin: z.number().int().min(1).max(24 * 60),
  display: z.string().trim().min(3).max(40),
})

export const patchSiteSettingsSchema = z
  .object({
    forceClosed: z.boolean().optional(),
    supportWhatsapp: z
      .string()
      .trim()
      .min(8)
      .max(30)
      .refine((value) => (value.match(/\d/g) || []).length >= 7, {
        message: 'Incluí un número real de WhatsApp.',
      })
      .optional(),
    hoursOverride: z
      .object({
        weekday: dayOverrideSchema.optional(),
        saturday: dayOverrideSchema.optional(),
        sunday: dayOverrideSchema.optional(),
      })
      .nullable()
      .optional(),
  })
  .refine(
    (v) =>
      v.forceClosed !== undefined ||
      v.supportWhatsapp !== undefined ||
      v.hoursOverride !== undefined,
    { message: 'No hay cambios que guardar.' }
  )

function defaultSettings(): MercadoSiteSettings {
  return {
    forceClosed: false,
    supportWhatsapp: MERCADO_DIRECTORY_WHATSAPP,
    hoursOverride: null,
    updatedAt: null,
    updatedBy: null,
  }
}

export function mergeMarketHours(override: HoursOverride | null | undefined): Record<
  MarketDayKey,
  MarketDayHours
> {
  const keys: MarketDayKey[] = ['weekday', 'saturday', 'sunday']
  const result = { ...MERCADO_MARKET_HOURS }
  for (const key of keys) {
    const o = override?.[key]
    if (!o) continue
    result[key] = {
      label: MERCADO_MARKET_HOURS[key].label,
      openMin: o.openMin,
      closeMin: o.closeMin,
      display: o.display,
    }
  }
  return result
}

export function hoursRowsFromMerged(
  hours: Record<MarketDayKey, MarketDayHours>
): Array<{ days: string; hours: string }> {
  return [
    { days: hours.weekday.label, hours: hours.weekday.display },
    { days: hours.saturday.label, hours: hours.saturday.display },
    { days: hours.sunday.label, hours: hours.sunday.display },
  ]
}

export function toSitePublic(settings: MercadoSiteSettings): MercadoSitePublic {
  const hours = mergeMarketHours(settings.hoursOverride)
  return {
    forceClosed: settings.forceClosed,
    supportWhatsapp: settings.supportWhatsapp || MERCADO_DIRECTORY_WHATSAPP,
    hoursRows: hoursRowsFromMerged(hours),
    hours,
  }
}

function mapRow(row: {
  force_closed?: boolean
  support_whatsapp?: string | null
  hours_override?: unknown
  updated_at?: string | null
  updated_by?: string | null
} | null): MercadoSiteSettings {
  if (!row) return defaultSettings()
  const override =
    row.hours_override && typeof row.hours_override === 'object'
      ? (row.hours_override as HoursOverride)
      : null
  return {
    forceClosed: Boolean(row.force_closed),
    supportWhatsapp: row.support_whatsapp?.trim() || MERCADO_DIRECTORY_WHATSAPP,
    hoursOverride: override,
    updatedAt: row.updated_at ?? null,
    updatedBy: row.updated_by ?? null,
  }
}

export async function getMercadoSiteSettings(): Promise<MercadoSiteSettings> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from(SITE_SETTINGS_TABLE)
      .select('force_closed, support_whatsapp, hours_override, updated_at, updated_by')
      .eq('id', SITE_SETTINGS_ROW_ID)
      .maybeSingle()

    if (error) {
      logger.error('mercado site settings get', { error: error.message })
      return defaultSettings()
    }
    return mapRow(data)
  } catch (error) {
    logger.error('mercado site settings get crash', {
      error: error instanceof Error ? error.message : 'unknown',
    })
    return defaultSettings()
  }
}

export async function getMercadoSitePublic(): Promise<MercadoSitePublic> {
  return toSitePublic(await getMercadoSiteSettings())
}
