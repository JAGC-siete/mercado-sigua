import type { NextApiRequest, NextApiResponse } from 'next'
import { createAdminClient } from '../../../lib/supabase/admin'
import { createMercadoServerClient } from '../../../lib/supabase/server'
import {
  AUTH_LOGIN_LIMIT,
  withAuthRateLimit,
} from '../../../lib/rate-limit'
import {
  canLoginToApp,
  isAppRole,
  normalizeLoginEmail,
  normalizeLoginPassword,
  postLoginPath,
  type AppRole,
} from '../../../lib/auth/role-access'
import { createUserSessionRow } from '../../../lib/auth/session-manager'
import { resolveOrClaimVendor } from '../../../lib/auth/vendor-claim'
import { logger } from '../../../lib/logger'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const email = normalizeLoginEmail(
    typeof req.body?.email === 'string' ? req.body.email : ''
  )
  const password = normalizeLoginPassword(
    typeof req.body?.password === 'string' ? req.body.password : ''
  )
  const redirect =
    typeof req.body?.redirect === 'string' ? req.body.redirect : null

  if (!email.includes('@') || password.length < 8) {
    return res.status(403).json({ error: 'Credenciales inválidas' })
  }

  try {
    const supabase = createMercadoServerClient(req, res)
    const { data: signIn, error: signErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signErr || !signIn.user || !signIn.session) {
      return res.status(403).json({ error: 'Credenciales inválidas' })
    }

    const admin = createAdminClient()
    const { data: profile, error: profileErr } = await admin
      .from('user_profiles')
      .select('id, role, is_active, permissions')
      .eq('id', signIn.user.id)
      .maybeSingle()

    if (profileErr || !profile || !isAppRole(profile.role) || !canLoginToApp(profile.role, Boolean(profile.is_active))) {
      await supabase.auth.signOut()
      return res.status(403).json({ error: 'Credenciales inválidas' })
    }

    const role = profile.role as AppRole
    let vendorId: string | null = null

    if (role === 'vendor') {
      const vendor = await resolveOrClaimVendor(signIn.user.id, email)
      if (!vendor) {
        await supabase.auth.signOut()
        return res.status(403).json({ error: 'Credenciales inválidas' })
      }
      vendorId = vendor.id
    }

    const sessionId = await createUserSessionRow(signIn.user.id, req)
    if (!sessionId) {
      logger.warn('login session row failed', { userId: signIn.user.id })
    }

    return res.status(200).json({
      user: {
        id: signIn.user.id,
        email: signIn.user.email ?? email,
        role,
        vendor_id: vendorId,
      },
      session: {
        access_token: signIn.session.access_token,
        refresh_token: signIn.session.refresh_token,
        expires_at: signIn.session.expires_at,
        session_id: sessionId,
      },
      userProfile: {
        id: profile.id,
        role,
        is_active: profile.is_active,
        permissions: profile.permissions ?? {},
      },
      redirectTo: postLoginPath(role, redirect),
    })
  } catch (error: unknown) {
    logger.error('auth login', {
      error: error instanceof Error ? error.message : 'Unknown',
    })
    return res.status(500).json({ error: 'No se pudo iniciar sesión' })
  }
}

export default withAuthRateLimit(AUTH_LOGIN_LIMIT, handler)
