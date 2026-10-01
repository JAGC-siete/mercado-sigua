import { siteAbsoluteUrl, siteOrigin } from '../site'

export function mercadoPublicOrigin() {
  return siteOrigin()
}

export function mercadoAbsoluteUrl(path: string) {
  return siteAbsoluteUrl(path)
}
