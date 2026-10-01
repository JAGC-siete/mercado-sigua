import type { NextApiRequest, NextApiResponse } from 'next'
import { createAdminClient } from '../supabase/admin'
import { createMercadoServerClient } from '../supabase/server'
import { logger } from '../logger'
import {
  canLoginToApp,
  isAppRole,
  type AppRole,
  type UserProfileRow,
} from './role-access'
import { clientIp, clientUserAgent } from './session-manager'

export type AuthContext = {
  userId: string
  email: string | null
  role: AppRole
  profile: UserProfileRow
  accessToken: string
}

async function loadProfile(userId: string): Promise<UserProfileRow | null> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('user_profiles')
    .select('id, role, is_active, permissions')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return null
  if (!isAppRole(data.role)) return null
  return {
    id: data.id as string,
    role: data.role,
    is_active: Boolean(data.is_active),
    permissions: (data.permissions ?? {}) as Record<string, unknown>,
  }
}

async function resolveAccessToken(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{ userId: string; email: string | null; accessToken: string } | null> {
  const supabase = createMercadoServerClient(req, res)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (!error && user) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.access_token) {
      return {
        userId: user.id,
        email: user.email ?? null,
        accessToken: session.access_token,
      }
    }
  }

  const authHeader = req.headers.authorization
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length).trim()
    if (!token) return null
    const admin = createAdminClient()
    const { data, error: bearerErr } = await admin.auth.getUser(token)
    if (bearerErr || !data.user) return null
    return {
      userId: data.user.id,
      email: data.user.email ?? null,
      accessToken: token,
    }
  }

  return null
}

export async function requireAuthApi(
  req: NextApiRequest,
  res: NextApiResponse,
  allowedRoles?: AppRole[]
): Promise<AuthContext | null> {
  const identity = await resolveAccessToken(req, res)
  if (!identity) {
    res.status(401).json({ error: 'Inicia sesión' })
    return null
  }

  const profile = await loadProfile(identity.userId)
  if (!profile || !canLoginToApp(profile.role, profile.is_active)) {
    res.status(403).json({ error: 'Credenciales inválidas' })
    return null
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    res.status(403).json({ error: 'Sin permiso' })
    return null
  }

  return {
    userId: identity.userId,
    email: identity.email,
    role: profile.role,
    profile,
    accessToken: identity.accessToken,
  }
}

export async function requireSuperAdmin(
  req: NextApiRequest,
  res: NextApiResponse,
  action: string
): Promise<AuthContext | null> {
  const ctx = await requireAuthApi(req, res, ['super_admin'])
  if (!ctx) return null

  logger.info('super_admin_audit', {
    action,
    userId: ctx.userId,
    email: ctx.email,
    ip: clientIp(req),
    ua: clientUserAgent(req).slice(0, 180),
  })

  return ctx
}
