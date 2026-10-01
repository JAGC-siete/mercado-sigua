/**
 * Beacon público: click en Pedir y Recoger / Reservar por WhatsApp.
 * Sin PII. Rate limit ligero. Insert service role.
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { logger } from '../../../lib/logger'
import { withRateLimit } from '../../../lib/rate-limit'
import { VENDORS_TABLE } from '../../../lib/mercado/schema'
import { createMercadoAdminClient } from '../../../lib/mercado/vendors-db'

const WA_CLICKS_TABLE = 'mercado_wa_clicks'

const bodySchema = z.object({
  vendorId: z.string().uuid(),
})

const WA_CLICK_LIMIT = { windowMs: 60_000, max: 40 }

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método no permitido' })
  }

  let raw = req.body
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw)
    } catch {
      return res.status(400).end()
    }
  }

  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return res.status(400).end()
  }

  try {
    const admin = createMercadoAdminClient()
    const { data: vendor } = await admin
      .from(VENDORS_TABLE)
      .select('id')
      .eq('id', parsed.data.vendorId)
      .eq('status', 'active')
      .maybeSingle()

    if (!vendor) {
      return res.status(204).end()
    }

    const { error } = await admin.from(WA_CLICKS_TABLE).insert({
      vendor_id: parsed.data.vendorId,
    })

    if (error) {
      logger.error('mercado wa-click insert', { error: error.message })
    }

    return res.status(204).end()
  } catch (error: unknown) {
    logger.error('mercado wa-click', {
      error: error instanceof Error ? error.message : 'Unknown',
    })
    return res.status(204).end()
  }
}

export default withRateLimit(WA_CLICK_LIMIT, handler)
