import { createHash } from 'crypto'
import type { NextApiRequest } from 'next'
import { createAdminClient } from '../supabase/admin'
import { SESSION_IDLE_MINUTES, SESSION_TTL_HOURS } from './role-access'

function hashValue(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}

export function clientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  return req.socket.remoteAddress || 'unknown'
}

export function clientUserAgent(req: NextApiRequest): string {
  const ua = req.headers['user-agent']
  return typeof ua === 'string' ? ua : ''
}

export async function createUserSessionRow(
  userId: string,
  req: NextApiRequest
): Promise<string | null> {
  const admin = createAdminClient()
  const { data, error } = await admin.rpc('create_user_session', {
    p_user_id: userId,
    p_ttl_hours: SESSION_TTL_HOURS,
    p_ip_hash: hashValue(clientIp(req)),
    p_ua_hash: hashValue(clientUserAgent(req) || 'unknown'),
  })
  if (error) return null
  return typeof data === 'string' ? data : null
}

export async function touchUserSession(sessionId: string): Promise<boolean> {
  const admin = createAdminClient()
  const { data, error } = await admin.rpc('update_session_activity', {
    p_session_id: sessionId,
    p_idle_minutes: SESSION_IDLE_MINUTES,
  })
  if (error) return false
  return data === true
}

export const LOCAL_STORAGE_USER_KEY = 'user'
export const LOCAL_STORAGE_SESSION_KEY = 'mercado_app_session_id'
