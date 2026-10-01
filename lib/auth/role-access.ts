export const APP_ROLES = ['super_admin', 'vendor'] as const
export type AppRole = (typeof APP_ROLES)[number]

export const SESSION_TTL_HOURS = 12
export const SESSION_IDLE_MINUTES = 90

export type UserProfileRow = {
  id: string
  role: AppRole
  is_active: boolean
  permissions: Record<string, unknown>
}

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === 'string' && (APP_ROLES as readonly string[]).includes(value)
}

export function canLoginToApp(role: string | null | undefined, isActive: boolean): boolean {
  if (!isActive) return false
  return isAppRole(role)
}

export function normalizeLoginEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Quita whitespace invisible / espacios alrededor de la password. */
export function normalizeLoginPassword(password: string): string {
  return password.replace(/[\u200B-\u200D\uFEFF]/g, '').trim()
}

export function postLoginPath(role: AppRole, redirect?: string | null): string {
  const safe =
    typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
      ? redirect
      : null

  if (role === 'super_admin') {
    if (safe && (safe === '/app/mercado' || safe.startsWith('/app/mercado/'))) return safe
    return '/app/mercado'
  }

  return '/app'
}
