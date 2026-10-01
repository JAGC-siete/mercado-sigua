import type { NextApiRequest, NextApiResponse } from 'next'
import {
  mercadoAdminConfigured,
  mercadoAdminSetCookie,
  verifyMercadoAdminCredentials,
} from '../../../../lib/mercado/admin-auth'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método no permitido' })
  }

  if (!mercadoAdminConfigured()) {
    return res.status(503).json({ error: 'Operador del directorio no configurado' })
  }

  const email = typeof req.body?.email === 'string' ? req.body.email : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  if (!verifyMercadoAdminCredentials(email, password)) {
    return res.status(401).json({ error: 'Credenciales inválidas' })
  }

  mercadoAdminSetCookie(res, { email: email.trim().toLowerCase() })
  return res.status(200).json({ ok: true })
}
