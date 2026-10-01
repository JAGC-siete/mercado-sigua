import type { NextApiRequest, NextApiResponse } from 'next'
import { AUTH_LOGIN_API_PATH } from '../../../../lib/mercado/paths'

/** Corte HMAC: el login unificado vive en POST /api/auth/login. */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(410).json({
    error: 'Este endpoint fue retirado. Usá el login unificado.',
    loginApi: AUTH_LOGIN_API_PATH,
  })
}
