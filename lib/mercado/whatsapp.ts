/**
 * Plantillas WhatsApp del modelo Pickup (reserva → listo → recoger).
 * Sin carrito ni checkout.
 */

import type { VendorCategory } from './categories'
import type { PublicVendorCard } from './schema'

/** Canal de reserva del directorio mientras el puesto no publica el número del locatario. */
export const MERCADO_DIRECTORY_WHATSAPP = '50432226773'

export function vendorWhatsAppDigits(whatsapp: string): string {
  const digits = whatsapp.replace(/\D/g, '')
  if (digits.length === 8) return `504${digits}`
  return digits
}

function perishableHint(category: VendorCategory): string {
  switch (category) {
    case 'carnes':
      return ' Por favor confirmame el corte (ej. fino / grueso) y si querés que lo empape.'
    case 'frutas':
      return ' Por favor confirmame el nivel de madurez (verde / maduro / para hoy).'
    case 'verduras':
      return ' Por favor confirmame si lo querés recién cortado o para guardar.'
    case 'comida':
      return ' Por favor confirmame para qué hora lo apartás.'
    default:
      return ''
  }
}

export function vendorReservationMessage(
  vendor: Pick<PublicVendorCard, 'name' | 'stallLocation' | 'products' | 'category'>,
  options?: { product?: string }
): string {
  const stall = vendor.stallLocation
    ? ` Quiero reservar para recoger en ${vendor.stallLocation}.`
    : ' Quiero reservar para recoger en el puesto.'
  const product =
    options?.product?.trim() ||
    (vendor.products[0] ? vendor.products[0] : null)
  const interest = product
    ? ` Me gustaría reservar ${product} para recoger hoy.`
    : vendor.products.length > 0
      ? ` Me interesa: ${vendor.products.join(', ')}.`
      : ''
  const hint = perishableHint(vendor.category as VendorCategory)
  return `Hola, vengo del directorio San Pablo y quiero pedir en ${vendor.name}.${stall}${interest}${hint}`
}

export function vendorReadyForPickupMessage(
  vendor: Pick<PublicVendorCard, 'name' | 'stallLocation'>
): string {
  const stall = vendor.stallLocation ?? 'el puesto'
  return `Hola, tu pedido en ${vendor.name} ya está listo. Pasá a recogerlo en ${stall} del Mercado Municipal San Pablo. Llevá tu comprobante de transferencia si pagaste por BAC.`
}

export function vendorWhatsAppHref(whatsapp: string, vendorName: string): string {
  const digits = vendorWhatsAppDigits(whatsapp)
  const text = encodeURIComponent(
    `Hola, vi tu puesto ${vendorName} en el Mercado Municipal San Pablo.`
  )
  return `https://wa.me/${digits}?text=${text}`
}

export function vendorReservationHref(
  vendor: Pick<PublicVendorCard, 'name' | 'stallLocation' | 'products' | 'whatsapp' | 'category'>,
  directoryWhatsApp = MERCADO_DIRECTORY_WHATSAPP,
  options?: { product?: string }
): string {
  const digits = vendorWhatsAppDigits(vendor.whatsapp ?? directoryWhatsApp)
  return `https://wa.me/${digits}?text=${encodeURIComponent(
    vendorReservationMessage(vendor, options)
  )}`
}

export function vendorReadyHref(
  vendor: Pick<PublicVendorCard, 'name' | 'stallLocation' | 'whatsapp'>,
  directoryWhatsApp = MERCADO_DIRECTORY_WHATSAPP
): string {
  const digits = vendorWhatsAppDigits(vendor.whatsapp ?? directoryWhatsApp)
  return `https://wa.me/${digits}?text=${encodeURIComponent(vendorReadyForPickupMessage(vendor))}`
}
