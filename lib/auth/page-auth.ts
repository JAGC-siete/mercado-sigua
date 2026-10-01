import type { GetServerSidePropsContext } from 'next'
import { createAdminClient } from '../supabase/admin'
import { createMercadoPagesServerClient } from '../supabase/server'
import {
  canLoginToApp,
  isAppRole,
  type AppRole,
  type UserProfileRow,
} from './role-access'
import { APP_LOGIN_PATH, appLoginPath } from '../mercado/paths'

export type PageAuthOk = {
  ok: true
  userId: string
  email: string | null
  role: AppRole
  profile: UserProfileRow
}

export type PageAuthFail = {
  ok: false
  redirect: { destination: string; permanent: false }
}

async function loadProfile(userId: string): Promise<UserProfileRow | null> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('user_profiles')
    .select('id, role, is_active, permissions')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data || !isAppRole(data.role)) return null
  return {
    id: data.id as string,
    role: data.role,
    is_active: Boolean(data.is_active),
    permissions: (data.permissions ?? {}) as Record<string, unknown>,
  }
}

async function resolvePageAuth(
  ctx: GetServerSidePropsContext
): Promise<PageAuthOk | null> {
  const supabase = createMercadoPagesServerClient(ctx)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null

  const profile = await loadProfile(user.id)
  if (!profile || !canLoginToApp(profile.role, profile.is_active)) return null

  return {
    ok: true,
    userId: user.id,
    email: user.email ?? null,
    role: profile.role,
    profile,
  }
}

export async function requireSuperAdminPage(
  ctx: GetServerSidePropsContext
): Promise<PageAuthOk | PageAuthFail> {
  const auth = await resolvePageAuth(ctx)
  if (!auth) {
    const next =
      ctx.resolvedUrl && ctx.resolvedUrl !== APP_LOGIN_PATH ? ctx.resolvedUrl : undefined
    return { ok: false, redirect: { destination: appLoginPath(next), permanent: false } }
  }
  if (auth.role !== 'super_admin') {
    return { ok: false, redirect: { destination: '/app', permanent: false } }
  }
  return auth
}

export async function requireVendorPage(
  ctx: GetServerSidePropsContext
): Promise<PageAuthOk | PageAuthFail> {
  const auth = await resolvePageAuth(ctx)
  if (!auth) {
    const next =
      ctx.resolvedUrl && ctx.resolvedUrl !== APP_LOGIN_PATH ? ctx.resolvedUrl : undefined
    return { ok: false, redirect: { destination: appLoginPath(next), permanent: false } }
  }
  if (auth.role !== 'vendor' && auth.role !== 'super_admin') {
    return { ok: false, redirect: { destination: appLoginPath(), permanent: false } }
  }
  return auth
}
