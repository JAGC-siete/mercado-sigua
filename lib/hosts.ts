/**
 * Hosts del directorio y redirecciones 301 de la marca anterior (Mercado San Pablo).
 * Una sola función decide host y ruta para que cada URL vieja llegue en un solo salto.
 */

import {
  LEGACY_DIRECTORY_PREFIX,
  LEGACY_SAN_PABLO_PREFIX,
  MERCADO_INSCRIPTION_PATH,
  MERCADO_LEGACY_PREFIX,
  MERCADO_V2_PREFIX,
  mercadoHomePath,
  mercadoVendorPath,
} from './mercado/paths'

const MERCADO_DEFAULT_HOSTS = ['sigua-online.com']
const LEGACY_DEFAULT_HOSTS = ['mercado.humanosisu.net', 'www.sigua-online.com']

function hostSet(envName: string, defaults: readonly string[]): Set<string> {
  const extra = (process.env[envName] || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
  return new Set([...defaults, ...extra])
}

export function hostnameOf(hostHeader: string): string {
  return hostHeader.split(':')[0].trim().toLowerCase()
}

export function mercadoHostnames(): Set<string> {
  return hostSet('MERCADO_HOSTS', MERCADO_DEFAULT_HOSTS)
}

/** Hosts que se mandan con 301 al host canónico. */
export function legacyHostnames(): Set<string> {
  return hostSet('MERCADO_LEGACY_HOSTS', LEGACY_DEFAULT_HOSTS)
}

/**
 * Host de NEXT_PUBLIC_SITE_URL. null en local o sin variable: así un deploy
 * que todavía apunta a mercado.humanosisu.net no redirige a un dominio sin DNS.
 */
export function canonicalHostname(siteUrl = process.env.NEXT_PUBLIC_SITE_URL): string | null {
  if (!siteUrl) return null
  try {
    const host = new URL(siteUrl).hostname.toLowerCase()
    if (!host || /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(host)) return null
    return host
  } catch {
    return null
  }
}

function isStaticFilePath(pathname: string): boolean {
  const last = pathname.split('/').pop() ?? ''
  return last.includes('.')
}

function stripPrefix(pathname: string, prefix: string): string | null {
  if (pathname === prefix || pathname === `${prefix}/`) return ''
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length + 1).replace(/\/$/, '')
  return null
}

function directoryRestToPath(rest: string): string {
  if (!rest) return mercadoHomePath()
  if (rest === 'inscripcion') return MERCADO_INSCRIPTION_PATH
  return mercadoVendorPath(rest)
}

/** Ruta actual para una ruta de la marca anterior; null si no es una ruta vieja. */
export function currentPathForLegacy(pathname: string): string | null {
  if (isStaticFilePath(pathname)) return null

  const sanPablo = stripPrefix(pathname, LEGACY_SAN_PABLO_PREFIX)
  if (sanPablo !== null) return MERCADO_V2_PREFIX

  const directory = stripPrefix(pathname, LEGACY_DIRECTORY_PREFIX)
  if (directory !== null) return directoryRestToPath(directory)

  const legacy = stripPrefix(pathname, MERCADO_LEGACY_PREFIX)
  if (legacy !== null) return directoryRestToPath(legacy)

  return null
}

export type RedirectTarget = {
  /** https://host canónico, o null para quedarse en el mismo host. */
  origin: string | null
  pathname: string
}

export function redirectTargetFor(
  hostHeader: string,
  pathname: string,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL
): RedirectTarget | null {
  const host = hostnameOf(hostHeader)
  const canonical = canonicalHostname(siteUrl)
  // APIs y assets de Next no se redirigen: un POST con 301 llega como GET.
  const movesHost =
    canonical !== null &&
    host !== canonical &&
    legacyHostnames().has(host) &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/_next/')

  const nextPath = currentPathForLegacy(pathname)
  if (!movesHost && nextPath === null) return null

  return {
    origin: movesHost ? `https://${canonical}` : null,
    pathname: nextPath ?? pathname,
  }
}
