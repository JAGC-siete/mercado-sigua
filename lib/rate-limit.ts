import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

const hits = new Map<string, { count: number; resetAt: number }>()

function clientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  return req.socket.remoteAddress || 'unknown'
}

function takeHit(key: string, windowMs: number, max: number): boolean {
  const now = Date.now()
  const current = hits.get(key)
  if (!current || current.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  current.count += 1
  return current.count <= max
}

export function withRateLimit(
  config: { windowMs: number; max: number },
  handler: NextApiHandler
): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const ip = clientIp(req)
    if (!takeHit(`ip:${ip}`, config.windowMs, config.max)) {
      return res.status(429).json({
        success: false,
        error: 'Demasiados envíos. Intenta en unos minutos.',
      })
    }
    return handler(req, res)
  }
}

/** Rate limit por IP y por IP+email (login / forgot-password). */
export function withAuthRateLimit(
  config: {
    windowMs: number
    maxPerIp: number
    maxPerIpEmail: number
  },
  handler: NextApiHandler
): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const ip = clientIp(req)
    const emailRaw = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const emailKey = emailRaw || 'empty'

    if (!takeHit(`auth-ip:${ip}`, config.windowMs, config.maxPerIp)) {
      return res.status(429).json({ error: 'Demasiados intentos. Intenta en unos minutos.' })
    }
    if (!takeHit(`auth-ip-email:${ip}:${emailKey}`, config.windowMs, config.maxPerIpEmail)) {
      return res.status(429).json({ error: 'Demasiados intentos. Intenta en unos minutos.' })
    }
    return handler(req, res)
  }
}

export const PUBLIC_LEAD_LIMIT = { windowMs: 10 * 60 * 1000, max: 6 }
export const AUTH_LOGIN_LIMIT = {
  windowMs: 15 * 60 * 1000,
  maxPerIp: 40,
  maxPerIpEmail: 8,
}
