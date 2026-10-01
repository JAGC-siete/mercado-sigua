import WhatsAppGlyph from './WhatsAppGlyph'
import { vendorReservationHref } from '../../lib/mercado/whatsapp'
import { MERCADO_WA_CLICK_API_PATH } from '../../lib/mercado/paths'
import type { PublicVendorCard } from '../../lib/mercado/schema'
import styles from './mercado.module.css'

const cardClass =
  `${styles.waPulse} flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-base font-bold text-white shadow-md hover:bg-green-600`

const heroClass =
  `${styles.heroWa} flex min-h-16 w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-4 text-lg font-bold text-white shadow-md hover:bg-green-600`

function trackWaClick(vendorId: string | undefined) {
  if (!vendorId) return
  const body = JSON.stringify({ vendorId })
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon(MERCADO_WA_CLICK_API_PATH, blob)
      return
    }
  } catch {
    // fall through
  }
  void fetch(MERCADO_WA_CLICK_API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {})
}

export default function VendorWhatsAppButton({
  vendor,
  size = 'card',
}: {
  vendor: PublicVendorCard
  size?: 'card' | 'hero'
}) {
  const className = size === 'hero' ? heroClass : cardClass
  const label = size === 'hero' ? 'Reservar por WhatsApp' : 'Pedir y Recoger'

  return (
    <a
      href={vendorReservationHref(vendor)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackWaClick(vendor.id)}
    >
      <WhatsAppGlyph className="h-6 w-6" />
      {label}
    </a>
  )
}
