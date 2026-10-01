/**
 * Mapeo fila DB ↔ PublicVendorCard y lecturas públicas del directorio.
 * Pickup only: sin carrito ni stock.
 * Lecturas públicas → anon client (RLS). Escrituras admin → createAdminClient.
 */

import { createAdminClient } from '../supabase/admin'
import { logger } from '../logger'
import {
  DEFAULT_VENDOR_PAYMENT_METHODS,
  VENDORS_TABLE,
  type PublicVendorCard,
  type VendorPaymentMethod,
  type VendorStatus,
} from './schema'
import {
  MERCADO_HOME_PREVIEW_VENDORS,
  findPreviewVendor,
  previewVendorsByCategory,
} from './home'
import type { VendorCategory } from './categories'
import { isVendorCategory } from './categories'
import { createPublicMercadoClient } from './public-client'

export type VendorRow = {
  id: string
  application_id?: string | null
  name: string
  slug: string
  description: string
  category: string
  whatsapp: string
  status: VendorStatus
  logo_url: string | null
  stall_location: string | null
  hours_note: string | null
  contact_email?: string | null
  auth_user_id?: string | null
  claimed_at?: string | null
  featured: boolean
  vip_expires_at?: string | null
  vip_notes?: string | null
  products: string[] | null
  payment_methods: string[] | null
  gallery: unknown
  created_at?: string
  updated_at?: string
}

/** Columnas permitidas al rol anon (GRANT). Sin application_id / company_id. */
export const VENDOR_ANON_COLUMNS =
  'id, name, slug, description, category, whatsapp, status, logo_url, stall_location, hours_note, featured, products, payment_methods, gallery, created_at, updated_at'

export const VENDOR_PUBLIC_COLUMNS = VENDOR_ANON_COLUMNS

export const VENDOR_ADMIN_COLUMNS =
  'id, application_id, name, slug, description, category, whatsapp, status, logo_url, stall_location, hours_note, contact_email, auth_user_id, claimed_at, featured, vip_expires_at, vip_notes, products, payment_methods, gallery, created_at, updated_at'

export const MERCADO_ISR_REVALIDATE_SECONDS = 60

function parseGallery(value: unknown): PublicVendorCard['gallery'] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const src = (item as { src?: unknown }).src
      const alt = (item as { alt?: unknown }).alt
      if (typeof src !== 'string' || typeof alt !== 'string') return null
      return { src, alt }
    })
    .filter((item): item is { src: string; alt: string } => Boolean(item))
    .slice(0, 4)
}

function parsePaymentMethods(value: string[] | null): VendorPaymentMethod[] {
  const allowed = new Set<string>(DEFAULT_VENDOR_PAYMENT_METHODS)
  const methods = (value ?? []).filter((item): item is VendorPaymentMethod => allowed.has(item))
  return methods.length > 0 ? methods : [...DEFAULT_VENDOR_PAYMENT_METHODS]
}

export function vendorRowToPublicCard(row: VendorRow): PublicVendorCard | null {
  if (!isVendorCategory(row.category)) return null
  const products = (row.products ?? []).map((p) => p.trim()).filter(Boolean).slice(0, 5)
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description,
    whatsapp: row.whatsapp,
    logoUrl: row.logo_url,
    stallLocation: row.stall_location,
    hoursNote: row.hours_note,
    products: products.length > 0 ? products : ['Consultar por WhatsApp'],
    paymentMethods: parsePaymentMethods(row.payment_methods),
    gallery: parseGallery(row.gallery),
    featured: Boolean(row.featured),
  }
}

export function sortVendorsForDirectory(vendors: PublicVendorCard[]): PublicVendorCard[] {
  return [...vendors].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return a.name.localeCompare(b.name, 'es')
  })
}

export async function countActiveVendorsFromDb(): Promise<number> {
  try {
    const supabase = createPublicMercadoClient()
    const { count, error } = await supabase
      .from(VENDORS_TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')

    if (error) {
      logger.error('mercado: countActiveVendorsFromDb', { error: error.message })
      return 0
    }
    return count ?? 0
  } catch (error) {
    logger.error('mercado: countActiveVendorsFromDb crash', {
      error: error instanceof Error ? error.message : 'unknown',
    })
    return 0
  }
}

export async function listActiveVendorsFromDb(): Promise<PublicVendorCard[]> {
  try {
    const supabase = createPublicMercadoClient()
    const { data, error } = await supabase
      .from(VENDORS_TABLE)
      .select(VENDOR_ANON_COLUMNS)
      .eq('status', 'active')
      .order('featured', { ascending: false })
      .order('name', { ascending: true })

    if (error) {
      logger.error('mercado: listActiveVendorsFromDb', { error: error.message })
      return []
    }

    return sortVendorsForDirectory(
      (data as VendorRow[] | null ?? [])
        .map(vendorRowToPublicCard)
        .filter((v): v is PublicVendorCard => Boolean(v))
    )
  } catch (error) {
    logger.error('mercado: listActiveVendorsFromDb crash', {
      error: error instanceof Error ? error.message : 'unknown',
    })
    return []
  }
}

export async function listActiveVendorSlugsFromDb(): Promise<string[]> {
  try {
    const supabase = createPublicMercadoClient()
    const { data, error } = await supabase
      .from(VENDORS_TABLE)
      .select('slug')
      .eq('status', 'active')
      .order('slug', { ascending: true })

    if (error) {
      logger.error('mercado: listActiveVendorSlugsFromDb', { error: error.message })
      return []
    }
    return (data ?? [])
      .map((row) => (typeof row.slug === 'string' ? row.slug : ''))
      .filter(Boolean)
  } catch (error) {
    logger.error('mercado: listActiveVendorSlugsFromDb crash', {
      error: error instanceof Error ? error.message : 'unknown',
    })
    return []
  }
}

export async function findActiveVendorFromDb(slug: string): Promise<PublicVendorCard | null> {
  try {
    const supabase = createPublicMercadoClient()
    const { data, error } = await supabase
      .from(VENDORS_TABLE)
      .select(VENDOR_ANON_COLUMNS)
      .eq('slug', slug.toLowerCase().trim())
      .eq('status', 'active')
      .maybeSingle()

    if (error) {
      logger.error('mercado: findActiveVendorFromDb', { slug, error: error.message })
      return null
    }
    if (!data) return null
    return vendorRowToPublicCard(data as VendorRow)
  } catch (error) {
    logger.error('mercado: findActiveVendorFromDb crash', {
      error: error instanceof Error ? error.message : 'unknown',
    })
    return null
  }
}

/** DB si count > 0; si no, preview hardcodeado. */
export async function resolvePublicVendors(category?: VendorCategory | null): Promise<{
  vendors: PublicVendorCard[]
  source: 'database' | 'preview'
}> {
  const activeCount = await countActiveVendorsFromDb()
  if (activeCount === 0) {
    return { vendors: previewVendorsByCategory(category), source: 'preview' }
  }
  const fromDb = await listActiveVendorsFromDb()
  const filtered = category ? fromDb.filter((v) => v.category === category) : fromDb
  return { vendors: filtered, source: 'database' }
}

export async function resolvePublicVendor(slug: string): Promise<{
  vendor: PublicVendorCard | null
  source: 'database' | 'preview'
}> {
  const activeCount = await countActiveVendorsFromDb()
  if (activeCount === 0) {
    return { vendor: findPreviewVendor(slug), source: 'preview' }
  }

  const fromDb = await findActiveVendorFromDb(slug)
  return { vendor: fromDb, source: 'database' }
}

export function publicCardToInsert(payload: {
  name: string
  slug: string
  description: string
  category: VendorCategory
  whatsapp: string
  contactEmail?: string | null
  logoUrl?: string | null
  stallLocation?: string | null
  hoursNote?: string | null
  products: string[]
  paymentMethods: VendorPaymentMethod[]
  gallery: PublicVendorCard['gallery']
  status: VendorStatus
  featured: boolean
  vipExpiresAt?: string | null
  vipNotes?: string | null
  applicationId?: string | null
  userId?: string | null
}) {
  return {
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    category: payload.category,
    whatsapp: payload.whatsapp,
    contact_email: payload.contactEmail
      ? payload.contactEmail.trim().toLowerCase()
      : null,
    logo_url: payload.logoUrl ?? null,
    stall_location: payload.stallLocation ?? null,
    hours_note: payload.hoursNote ?? null,
    products: payload.products,
    payment_methods: payload.paymentMethods,
    gallery: payload.gallery,
    status: payload.status,
    featured: payload.featured,
    vip_expires_at: payload.featured ? payload.vipExpiresAt ?? null : null,
    vip_notes: payload.vipNotes?.trim() ? payload.vipNotes.trim().slice(0, 500) : null,
    application_id: payload.applicationId ?? null,
    created_by: payload.userId ?? null,
    updated_by: payload.userId ?? null,
  }
}

/** Admin list still uses service role (needs application_id). */
export function createMercadoAdminClient() {
  return createAdminClient()
}

export function previewVendorSlugs(): string[] {
  return MERCADO_HOME_PREVIEW_VENDORS.map((v) => v.slug)
}
