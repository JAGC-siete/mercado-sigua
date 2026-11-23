import type { VendorCategory } from './categories'
import type { PublicVendorCard } from './schema'

export interface VendorBuyStep {
  key: 'write' | 'reserve' | 'pickup'
  title: string
  body: string
}

function askCopy(category: VendorCategory, products: string[]) {
  const sample = products.slice(0, 2).join(' o ') || 'tu pedido'
  switch (category) {
    case 'carnes':
      return 'Pide tus cortes favoritos por WhatsApp.'
    case 'comida':
      return `Pide ${sample} por WhatsApp antes de que se acabe la olla.`
    case 'verduras':
    case 'frutas':
      return `Pide ${sample} por WhatsApp, recién cortado.`
    default:
      return `Pide ${sample} por WhatsApp.`
  }
}

function reserveCopy(vendor: PublicVendorCard) {
  const acceptsBac = vendor.paymentMethods.includes('transferencia_bac')
  const acceptsCash = vendor.paymentMethods.includes('efectivo')
  if (acceptsBac && vendor.category === 'carnes') {
    return 'Confirma tu pedido con una transferencia BAC.'
  }
  if (acceptsBac && acceptsCash) {
    return 'Confirma tu pedido. Pagas con transferencia BAC o en efectivo al recoger.'
  }
  if (acceptsBac) {
    return 'Confirma tu pedido con una transferencia BAC.'
  }
  return 'Confirma tu pedido y paga al recoger.'
}

export function vendorBuySteps(vendor: PublicVendorCard): VendorBuyStep[] {
  const stall = vendor.stallLocation ?? 'el negocio'
  return [
    { key: 'write', title: 'Escríbenos', body: askCopy(vendor.category, vendor.products) },
    { key: 'reserve', title: 'Reserva', body: reserveCopy(vendor) },
    { key: 'pickup', title: 'Recoge', body: `Pasa por ${stall} sin hacer fila.` },
  ]
}
