/**
 * Rutas del directorio Mercado Municipal San Pablo (Siguatepeque).
 * Público canónico se conserva para el cutover. Admin vive bajo /app/mercado.
 */

export const MERCADO_PUBLIC_PREFIX = '/mercadosanpablosigua'
export const MERCADO_V2_PREFIX = '/mercadosanpablosiguav2'
export const MERCADO_LEGACY_PREFIX = '/mercado'
export const MERCADO_ADMIN_PATH = '/app/mercado/fichas'
export const MERCADO_ADMIN_LOGIN_PATH = '/app/mercado/login'
export const MERCADO_VENDORS_API_PATH = '/api/admin/mercado/vendors'
export const MERCADO_VENDORS_UPLOAD_API_PATH = '/api/admin/mercado/upload'
export const MERCADO_INSCRIPTION_PATH = `${MERCADO_PUBLIC_PREFIX}/inscripcion`
export const MERCADO_INSCRIPTION_API_PATH = '/api/mercado/inscriptions'
export const MERCADO_APPLICATIONS_ADMIN_PATH = '/app/mercado/solicitudes'
export const MERCADO_APPLICATIONS_ADMIN_API_PATH = '/api/admin/mercado/applications'
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

export function mercadoAdminListPath(): string {
  return MERCADO_ADMIN_PATH
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

export function mercadoAdminLoginPath(next?: string): string {
  if (!next || next === MERCADO_ADMIN_LOGIN_PATH) return MERCADO_ADMIN_LOGIN_PATH
  return `${MERCADO_ADMIN_LOGIN_PATH}?next=${encodeURIComponent(next)}`
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
