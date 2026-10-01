/**
 * Ciclo VIP / aportación anual sobre mercado_vendors.featured.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** Default: aportación anual = hoy + 1 año (UTC). */
export function defaultVipExpiresAt(from = new Date()): string {
  const d = new Date(from)
  d.setUTCFullYear(d.getUTCFullYear() + 1)
  return d.toISOString()
}

export function daysUntilVipExpiry(expiresAt: string | null | undefined, now = new Date()): number | null {
  if (!expiresAt) return null
  const end = new Date(expiresAt)
  if (Number.isNaN(end.getTime())) return null
  return Math.ceil((end.getTime() - now.getTime()) / MS_PER_DAY)
}

export type VipBadgeKind = 'none' | 'active' | 'expiring' | 'expired'

export function vipBadgeKind(
  featured: boolean,
  expiresAt: string | null | undefined,
  now = new Date(),
  soonDays = 30
): VipBadgeKind {
  if (!featured) return 'none'
  const days = daysUntilVipExpiry(expiresAt, now)
  if (days === null) return 'active'
  if (days < 0) return 'expired'
  if (days <= soonDays) return 'expiring'
  return 'active'
}

export function vipBadgeLabel(
  featured: boolean,
  expiresAt: string | null | undefined,
  now = new Date()
): string {
  const kind = vipBadgeKind(featured, expiresAt, now)
  if (kind === 'none') return 'Sin aportación'
  if (kind === 'expired') return 'VIP vencido'
  if (kind === 'expiring') {
    const days = daysUntilVipExpiry(expiresAt, now)
    return days === 0 ? 'VIP vence hoy' : `VIP vence en ${days}d`
  }
  if (expiresAt) {
    const d = new Date(expiresAt)
    if (!Number.isNaN(d.getTime())) {
      return `VIP hasta ${d.toLocaleDateString('es-HN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}`
    }
  }
  return 'VIP activo'
}

/**
 * featured=true sin fecha → +1 año.
 * featured=false → limpia vip_expires_at.
 */
export function resolveVipFields(input: {
  featured?: boolean
  vipExpiresAt?: string | null
  vipNotes?: string | null
  previousFeatured?: boolean
  previousExpiresAt?: string | null
}): {
  featured?: boolean
  vip_expires_at?: string | null
  vip_notes?: string | null
} {
  const out: {
    featured?: boolean
    vip_expires_at?: string | null
    vip_notes?: string | null
  } = {}

  if (input.vipNotes !== undefined) {
    const trimmed = input.vipNotes?.trim() ?? ''
    out.vip_notes = trimmed ? trimmed.slice(0, 500) : null
  }

  const touchingFeatured = input.featured !== undefined
  const touchingExpires = input.vipExpiresAt !== undefined
  if (!touchingFeatured && !touchingExpires) return out

  const featured = touchingFeatured ? Boolean(input.featured) : Boolean(input.previousFeatured)

  if (touchingFeatured) out.featured = featured

  if (!featured) {
    out.vip_expires_at = null
    return out
  }

  if (touchingExpires && input.vipExpiresAt) {
    out.vip_expires_at = input.vipExpiresAt
    return out
  }

  const previous = input.previousExpiresAt
  if (previous && !touchingExpires) {
    // Keep existing expiry when only reaffirming featured
    if (touchingFeatured && input.previousFeatured) return out
  }

  if (previous && touchingFeatured && input.previousFeatured && !touchingExpires) {
    return out
  }

  out.vip_expires_at = previous && !touchingExpires ? previous : defaultVipExpiresAt()
  return out
}

export function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export function dateInputToIsoEndOfDay(dateYmd: string): string | null {
  const trimmed = dateYmd.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null
  return `${trimmed}T23:59:59.000Z`
}

export type VipListFilter = 'all' | 'vip_active' | 'vip_expiring' | 'vip_expired'

export function matchesVipFilter(
  featured: boolean,
  expiresAt: string | null | undefined,
  filter: VipListFilter,
  now = new Date()
): boolean {
  if (filter === 'all') return true
  const kind = vipBadgeKind(featured, expiresAt, now)
  if (filter === 'vip_active') return kind === 'active' || kind === 'expiring'
  if (filter === 'vip_expiring') return kind === 'expiring'
  if (filter === 'vip_expired') return kind === 'expired'
  return true
}
