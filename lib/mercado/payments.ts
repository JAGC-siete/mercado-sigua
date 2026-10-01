import type { VendorPaymentMethod } from './schema'

export const VENDOR_PAYMENT_METHOD_LABEL: Record<VendorPaymentMethod, string> = {
  efectivo: 'Efectivo',
  transferencia_bac: 'Transferencias BAC',
}

export const VENDOR_PAYMENT_METHOD_HINT: Record<VendorPaymentMethod, string> = {
  efectivo: 'Pagás al recoger',
  transferencia_bac: 'Reservá con transferencia',
}
