/**
 * Métricas agregadas para el home del operador.
 * Guard: JWT super_admin.
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { requireSuperAdmin } from '../../../../lib/auth/api-auth'
import { logger } from '../../../../lib/logger'
import { VENDOR_APPLICATIONS_TABLE } from '../../../../lib/mercado/inscription-schema'
import { VENDORS_TABLE } from '../../../../lib/mercado/schema'
import { createMercadoAdminClient } from '../../../../lib/mercado/vendors-db'
import { vipBadgeKind } from '../../../../lib/mercado/vip'

const WA_CLICKS_TABLE = 'mercado_wa_clicks'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const operator = await requireSuperAdmin(req, res, 'mercado.stats.GET')
  if (!operator) return

  const admin = createMercadoAdminClient()
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const now = new Date()

  try {
    const [
      pendingApps,
      activeVendors,
      featuredVendors,
      vendorsVip,
      waClicks,
    ] = await Promise.all([
      admin
        .from(VENDOR_APPLICATIONS_TABLE)
        .select('id', { count: 'exact', head: true })
        .in('status', ['received', 'reviewed']),
      admin
        .from(VENDORS_TABLE)
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      admin
        .from(VENDORS_TABLE)
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('featured', true),
      admin
        .from(VENDORS_TABLE)
        .select('id, name, featured, vip_expires_at')
        .eq('featured', true)
        .limit(500),
      admin
        .from(WA_CLICKS_TABLE)
        .select('vendor_id, created_at')
        .gte('created_at', since)
        .limit(5000),
    ])

    let vipExpiringSoon = 0
    let vipExpired = 0
    for (const row of vendorsVip.data ?? []) {
      const kind = vipBadgeKind(Boolean(row.featured), row.vip_expires_at as string | null, now)
      if (kind === 'expiring') vipExpiringSoon += 1
      if (kind === 'expired') vipExpired += 1
    }

    const clickCounts = new Map<string, number>()
    for (const row of waClicks.data ?? []) {
      const id = row.vendor_id as string
      clickCounts.set(id, (clickCounts.get(id) ?? 0) + 1)
    }

    const topIds = [...clickCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    let topVendorsByWa: Array<{ id: string; name: string; clicks: number }> = []
    if (topIds.length > 0) {
      const { data: named } = await admin
        .from(VENDORS_TABLE)
        .select('id, name')
        .in(
          'id',
          topIds.map(([id]) => id)
        )
      const nameById = new Map((named ?? []).map((v) => [v.id as string, v.name as string]))
      topVendorsByWa = topIds.map(([id, clicks]) => ({
        id,
        name: nameById.get(id) ?? id.slice(0, 8),
        clicks,
      }))
    }

    return res.status(200).json({
      pendingApplications: pendingApps.count ?? 0,
      activeVendors: activeVendors.count ?? 0,
      featuredVendors: featuredVendors.count ?? 0,
      vipExpiringSoon,
      vipExpired,
      waClicks7d: (waClicks.data ?? []).length,
      topVendorsByWa,
    })
  } catch (error: unknown) {
    logger.error('mercado stats', {
      error: error instanceof Error ? error.message : 'Unknown',
    })
    return res.status(500).json({ error: 'No se pudieron cargar las métricas' })
  }
}
