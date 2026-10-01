/**
 * Lectura pública de config del directorio (force_closed, hours, WhatsApp soporte).
 * Sin auth. Cache corto.
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { logger } from '../../../lib/logger'
import { getMercadoSitePublic } from '../../../lib/mercado/site-settings'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const site = await getMercadoSitePublic()
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')
    return res.status(200).json(site)
  } catch (error: unknown) {
    logger.error('mercado site-public', {
      error: error instanceof Error ? error.message : 'Unknown',
    })
    return res.status(500).json({ error: 'Error interno' })
  }
}
