/**
 * GET/PATCH config global del directorio.
 * Guard: JWT super_admin. Escritura: service role.
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { requireSuperAdmin } from '../../../../lib/auth/api-auth'
import { logger } from '../../../../lib/logger'
import { revalidateMercadoPages } from '../../../../lib/mercado/revalidate'
import {
  SITE_SETTINGS_ROW_ID,
  SITE_SETTINGS_TABLE,
  getMercadoSiteSettings,
  patchSiteSettingsSchema,
  toSitePublic,
} from '../../../../lib/mercado/site-settings'
import { createMercadoAdminClient } from '../../../../lib/mercado/vendors-db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!['GET', 'PATCH'].includes(req.method ?? '')) {
    res.setHeader('Allow', 'GET, PATCH')
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const operator = await requireSuperAdmin(req, res, `mercado.settings.${req.method}`)
  if (!operator) return

  try {
    if (req.method === 'GET') {
      const settings = await getMercadoSiteSettings()
      return res.status(200).json({
        settings,
        public: toSitePublic(settings),
      })
    }

    const parsed = patchSiteSettingsSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message ?? 'Datos inválidos',
      })
    }

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      updated_by: operator.email || operator.userId,
    }
    if (parsed.data.forceClosed !== undefined) patch.force_closed = parsed.data.forceClosed
    if (parsed.data.supportWhatsapp !== undefined) {
      patch.support_whatsapp = parsed.data.supportWhatsapp
    }
    if (parsed.data.hoursOverride !== undefined) {
      patch.hours_override = parsed.data.hoursOverride
    }

    const admin = createMercadoAdminClient()
    const { data, error } = await admin
      .from(SITE_SETTINGS_TABLE)
      .update(patch)
      .eq('id', SITE_SETTINGS_ROW_ID)
      .select('force_closed, support_whatsapp, hours_override, updated_at, updated_by')
      .maybeSingle()

    if (error || !data) {
      logger.error('mercado settings patch', { error: error?.message })
      return res.status(500).json({ error: 'No se pudo guardar la configuración' })
    }

    await revalidateMercadoPages(res)
    const settings = await getMercadoSiteSettings()
    return res.status(200).json({
      settings,
      public: toSitePublic(settings),
    })
  } catch (error: unknown) {
    logger.error('mercado settings API', {
      error: error instanceof Error ? error.message : 'Unknown',
    })
    return res.status(500).json({ error: 'Error interno' })
  }
}
