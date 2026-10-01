export function siteOrigin(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
  if (raw && !/localhost|127\.0\.0\.1/i.test(raw)) return raw
  if (typeof window !== 'undefined') return window.location.origin
  return raw || 'http://localhost:3000'
}

export function siteAbsoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${siteOrigin()}${path.startsWith('/') ? path : `/${path}`}`
}

export const SEO_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000'
