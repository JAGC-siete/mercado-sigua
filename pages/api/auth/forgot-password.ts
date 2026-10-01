import type { NextApiRequest, NextApiResponse } from 'next'
import { createMercadoServerClient } from '../../../lib/supabase/server'
import {
  AUTH_LOGIN_LIMIT,
  withAuthRateLimit,
} from '../../../lib/rate-limit'
import { normalizeLoginEmail } from '../../../lib/auth/role-access'
import { AUTH_UPDATE_PASSWORD_PATH, APP_LOGIN_PATH } from '../../../lib/mercado/paths'
import { logger } from '../../../lib/logger'

function siteOrigin(req: NextApiRequest): string {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
  if (configured) return configured
  const proto = (req.headers['x-forwarded-proto'] as string) || 'http'
  const host = req.headers.host || 'localhost:3000'
  return `${proto}://${host}`
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const email = normalizeLoginEmail(
    typeof req.body?.email === 'string' ? req.body.email : ''
  )

  // Respuesta uniforme para no filtrar existencia de cuentas.
  const okBody = {
    ok: true,
    message: 'Si el correo existe, enviamos instrucciones para restablecer la contraseña.',
  }

  if (!email.includes('@')) {
    return res.status(200).json(okBody)
  }

  try {
    const supabase = createMercadoServerClient(req, res)
    const redirectTo = `${siteOrigin(req)}${AUTH_UPDATE_PASSWORD_PATH}?next=${encodeURIComponent(APP_LOGIN_PATH)}`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) {
      logger.warn('forgot-password', { error: error.message })
    }
    return res.status(200).json(okBody)
  } catch (error: unknown) {
    logger.error('forgot-password', {
      error: error instanceof Error ? error.message : 'Unknown',
    })
    return res.status(200).json(okBody)
  }
}

export default withAuthRateLimit(AUTH_LOGIN_LIMIT, handler)
