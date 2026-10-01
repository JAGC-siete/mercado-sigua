/**
 * Rutas del directorio Mercado Municipal San Pablo (Siguatepeque).
 * Público canónico se conserva para el cutover. Admin vive bajo /app/mercado.
 */

export const MERCADO_PUBLIC_PREFIX = '/mercadosanpablosigua'
export const MERCADO_V2_PREFIX = '/mercadosanpablosiguav2'
export const MERCADO_LEGACY_PREFIX = '/mercado'
export const MERCADO_ADMIN_HOME_PATH = '/app/mercado'
export const MERCADO_ADMIN_PATH = '/app/mercado/fichas'
export const MERCADO_ADMIN_SETTINGS_PATH = '/app/mercado/configuracion'
/** @deprecated Usar APP_LOGIN_PATH. Se mantiene para redirects 301. */
export const MERCADO_ADMIN_LOGIN_PATH = '/app/mercado/login'
export const APP_LOGIN_PATH = '/app/login'
export const APP_FORGOT_PASSWORD_PATH = '/app/forgot-password'
export const APP_HOME_PATH = '/app'
export const AUTH_UPDATE_PASSWORD_PATH = '/auth/update-password'
export const AUTH_LOGIN_API_PATH = '/api/auth/login'
export const AUTH_LOGOUT_API_PATH = '/api/auth/logout'
export const AUTH_FORGOT_PASSWORD_API_PATH = '/api/auth/forgot-password'
export const AUTH_HEARTBEAT_API_PATH = '/api/auth/heartbeat'
export const MERCADO_VENDORS_API_PATH = '/api/admin/mercado/vendors'
export const MERCADO_VENDORS_UPLOAD_API_PATH = '/api/admin/mercado/upload'
export const MERCADO_VENDORS_INVITE_API_PATH = '/api/admin/mercado/invite'
export const MERCADO_ADMIN_SETTINGS_API_PATH = '/api/admin/mercado/settings'
export const MERCADO_ADMIN_STATS_API_PATH = '/api/admin/mercado/stats'
export const MERCADO_SITE_PUBLIC_API_PATH = '/api/mercado/site-public'
export const MERCADO_WA_CLICK_API_PATH = '/api/mercado/wa-click'
export const MERCADO_INSCRIPTION_PATH = `${MERCADO_PUBLIC_PREFIX}/inscripcion`
export const MERCADO_INSCRIPTION_API_PATH = '/api/mercado/inscriptions'
export const MERCADO_APPLICATIONS_ADMIN_PATH = '/app/mercado/solicitudes'
export const MERCADO_APPLICATIONS_ADMIN_API_PATH = '/api/admin/mercado/applications'
/** @deprecated Login unificado usa AUTH_LOGIN_API_PATH. */
export const MERCADO_ADMIN_LOGIN_API_PATH = '/api/mercado/admin/login'
export const MERCADO_ADMIN_LOGOUT_API_PATH = '/api/mercado/admin/logout'

export const MERCADO_STORAGE_BUCKET = 'mercado-san-pablo'

export function mercadoHomePath(): string {
  return MERCADO_PUBLIC_PREFIX
}

export function mercadoV2HomePath(): string {
  return MERCADO_V2_PREFIX
}

export function mercadoVendorPath(slug: string): string {
  return `${MERCADO_PUBLIC_PREFIX}/${slug}`
}

export function mercadoInscriptionPath(): string {
  return MERCADO_INSCRIPTION_PATH
}

export function mercadoCategoryPath(category: string): string {
  return `${MERCADO_PUBLIC_PREFIX}?categoria=${category}`
}

export function mercadoAdminHomePath(): string {
  return MERCADO_ADMIN_HOME_PATH
}

export function mercadoAdminListPath(): string {
  return MERCADO_ADMIN_PATH
}

export function mercadoAdminSettingsPath(): string {
  return MERCADO_ADMIN_SETTINGS_PATH
}

export function mercadoAdminNewPath(fromApplicationId?: string): string {
  const base = `${MERCADO_ADMIN_PATH}/nueva`
  if (!fromApplicationId) return base
  return `${base}?from=${encodeURIComponent(fromApplicationId)}`
}

export function mercadoAdminEditPath(id: string): string {
  return `${MERCADO_ADMIN_PATH}/${id}`
}

export function mercadoApplicationsAdminPath(): string {
  return MERCADO_APPLICATIONS_ADMIN_PATH
}

export function appLoginPath(redirect?: string): string {
  if (!redirect || redirect === APP_LOGIN_PATH) return APP_LOGIN_PATH
  return `${APP_LOGIN_PATH}?redirect=${encodeURIComponent(redirect)}`
}

/** @deprecated Usar appLoginPath. */
export function mercadoAdminLoginPath(next?: string): string {
  if (!next || next === MERCADO_ADMIN_LOGIN_PATH || next === APP_LOGIN_PATH) {
    return appLoginPath('/app/mercado')
  }
  return appLoginPath(next)
}

export function isPublicMercadoRoute(pathname: string): boolean {
  return (
    matchesPrefix(pathname, MERCADO_PUBLIC_PREFIX) ||
    matchesPrefix(pathname, MERCADO_V2_PREFIX) ||
    matchesPrefix(pathname, MERCADO_LEGACY_PREFIX)
  )
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}
