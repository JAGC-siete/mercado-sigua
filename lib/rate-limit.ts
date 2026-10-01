import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

const hits = new Map<string, { count: number; resetAt: number }>()

function clientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  return req.socket.remoteAddress || 'unknown'
}

export function withRateLimit(
  config: { windowMs: number; max: number },
  handler: NextApiHandler
): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const ip = clientIp(req)
    const now = Date.now()
    const current = hits.get(ip)
    if (!current || current.resetAt < now) {
      hits.set(ip, { count: 1, resetAt: now + config.windowMs })
      return handler(req, res)
    }
    current.count += 1
    if (current.count > config.max) {
      return res.status(429).json({ success: false, error: 'Demasiados envíos. Intenta en unos minutos.' })
    }
    return handler(req, res)
  }
}

export const PUBLIC_LEAD_LIMIT = { windowMs: 10 * 60 * 1000, max: 6 }
