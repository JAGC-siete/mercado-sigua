import type { NextApiRequest, NextApiResponse } from 'next'
import { mercadoAdminClearCookie } from '../../../../lib/mercado/admin-auth'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método no permitido' })
  }
  mercadoAdminClearCookie(res)
  return res.status(200).json({ ok: true })
}
