import { MERCADO_SEO } from './home'
import { VENDOR_CATEGORY_LABEL, type VendorCategory } from './categories'
import type { PublicVendorCard } from './schema'
import { mercadoAbsoluteUrl } from './public-url'
import { mercadoHomePath, mercadoInscriptionPath, mercadoVendorPath } from './paths'
import { mercadoStaticSrc } from './assets'

const META_MAX = 155

export const VENDOR_TITLE_HOOK: Record<VendorCategory, string> = {
  comida: 'Comida Corrida',
  verduras: 'Verduras frescas',
  frutas: 'Fruta fresca',
  carnes: 'Carnes frescas',
  granos: 'Granos',
  abarrotes: 'Abarrotes',
  ropa: 'Ropa',
  calzado: 'Calzado',
  artesanias: 'Artesanías',
  servicios: 'Servicios',
  otros: 'Puesto',
}

export function clampMetaDescription(text: string, max = META_MAX) {
  const compact = text.replace(/\s+/g, ' ').trim()
  if (compact.length <= max) return compact
  return `${compact.slice(0, max - 1).trimEnd()}…`
}

export function mercadoHomeTitle() {
  return MERCADO_SEO.title
}

export function mercadoHomeDescription() {
  return clampMetaDescription(MERCADO_SEO.description)
}

export function mercadoCategoryTitle(category: VendorCategory) {
  return `${VENDOR_CATEGORY_LABEL[category]} en Mercado San Pablo, Siguatepeque`
}

export function mercadoVendorTitle(vendor: Pick<PublicVendorCard, 'name' | 'category'>) {
  const hook = VENDOR_TITLE_HOOK[vendor.category as VendorCategory] ?? 'Puesto'
  return `${vendor.name} - ${hook} en Mercado San Pablo, Siguatepeque`
}

export function mercadoVendorDescription(vendor: Pick<PublicVendorCard, 'description'>) {
  return clampMetaDescription(`${vendor.description} Reservá por WhatsApp y recogé en Siguatepeque.`)
}

export function mercadoAssetUrl(path: string | null | undefined) {
  if (!path) return undefined
  return mercadoAbsoluteUrl(mercadoStaticSrc(path))
}

export function mercadoHomeCanonical() {
  return mercadoAbsoluteUrl(mercadoHomePath())
}

export function mercadoInscriptionTitle() {
  return 'Solicitud de registro de local en página web | Mercado Municipal San Pablo'
}

export function mercadoInscriptionDescription() {
  return clampMetaDescription(
    'Registrá tu local en el directorio del Mercado San Pablo. El básico es gratis; el VIP es aportación anual que se coordina después. Sin cuenta. La publicación no es inmediata.'
  )
}

export function mercadoInscriptionCanonical() {
  return mercadoAbsoluteUrl(mercadoInscriptionPath())
}

export function mercadoVendorCanonical(slug: string) {
  return mercadoAbsoluteUrl(mercadoVendorPath(slug))
}
