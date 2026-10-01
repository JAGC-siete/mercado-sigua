import { Banknote, Landmark, MapPin, MessageCircle, ShoppingBag, Smartphone } from 'lucide-react'
import { Badge } from '../ui/badge'
import { MercadoInscriptionCompactCta } from './InscriptionCta'
import VendorWhatsAppButton from './VendorWhatsAppButton'
import { vendorBuySteps } from '../../lib/mercado/buy-flow'
import { VENDOR_CATEGORY_LABEL, type VendorCategory } from '../../lib/mercado/categories'
import { MERCADO_SEO } from '../../lib/mercado/home'
import { VENDOR_PAYMENT_METHOD_HINT, VENDOR_PAYMENT_METHOD_LABEL } from '../../lib/mercado/payments'
import { mercadoHomePath } from '../../lib/mercado/paths'
import { mercadoStaticSrc } from '../../lib/mercado/assets'
import type { PublicVendorCard, VendorPaymentMethod } from '../../lib/mercado/schema'
import Link from 'next/link'
import styles from './mercado.module.css'

const STEP_ICON = {
  write: MessageCircle,
  reserve: Smartphone,
  pickup: ShoppingBag,
} as const

const PAYMENT_ICON: Record<VendorPaymentMethod, typeof Banknote> = {
  efectivo: Banknote,
  transferencia_bac: Landmark,
}

export default function VendorLanding({ vendor }: { vendor: PublicVendorCard }) {
  const categoryLabel = VENDOR_CATEGORY_LABEL[vendor.category as VendorCategory]
  const steps = vendorBuySteps(vendor)

  return (
    <article className={`mx-auto max-w-3xl px-4 py-12 ${styles.vendorLanding}`}>
      <Link href={mercadoHomePath()} className="text-sm text-amber-900 underline">
        Volver al directorio
      </Link>

      <header className="mt-6 flex items-start gap-5">
        {vendor.logoUrl && (
          <img
            src={mercadoStaticSrc(vendor.logoUrl)}
            alt={vendor.name}
            width={112}
            height={112}
            className="h-28 w-28 shrink-0 rounded-full object-cover ring-2 ring-amber-400 ring-offset-2"
          />
        )}
        <div>
          <Badge className="border-amber-800/20 bg-amber-50 text-amber-900">{categoryLabel}</Badge>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900">{vendor.name}</h1>
          <p className="mt-4 text-lg text-stone-600">{vendor.description}</p>
        </div>
      </header>

      <section className="mt-8" aria-labelledby="vendor-products">
        <h2 id="vendor-products" className="text-xl font-semibold text-stone-900">
          Productos principales
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {vendor.products.map((product) => (
            <li
              key={product}
              className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-800"
            >
              {product}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8">
        <VendorWhatsAppButton vendor={vendor} size="hero" />
        <p className="mt-3 text-sm text-stone-500">
          Reservá por WhatsApp, confirmá el pedido y recogé en el puesto.
        </p>
      </div>

      <section className="mt-8 rounded-xl border border-stone-200 bg-white p-5" aria-labelledby="vendor-payments">
        <h2 id="vendor-payments" className="text-sm font-medium text-stone-500">
          Métodos de pago
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {vendor.paymentMethods.map((method) => {
            const Icon = PAYMENT_ICON[method]
            return (
              <li key={method} className="flex items-center gap-3 rounded-lg bg-stone-50 px-3 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-900">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold text-stone-900">
                    {VENDOR_PAYMENT_METHOD_LABEL[method]}
                  </span>
                  <span className="block text-sm text-stone-500">{VENDOR_PAYMENT_METHOD_HINT[method]}</span>
                </span>
              </li>
            )
          })}
        </ul>
        <p className="mt-3 text-sm text-stone-600">
          Aceptamos {vendor.paymentMethods.map((method) => VENDOR_PAYMENT_METHOD_LABEL[method]).join(' y ')}.
        </p>
      </section>

      <h2 className="mt-10 text-xl font-semibold text-stone-900">Ubicación y horario</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <dt className="flex items-center gap-2 text-sm font-medium text-stone-500">
            <MapPin className="h-4 w-4" aria-hidden />
            Ubicación en el mercado
          </dt>
          <dd className="mt-1 text-stone-900">{vendor.stallLocation ?? MERCADO_SEO.addressLine}</dd>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <dt className="text-sm font-medium text-stone-500">Horario</dt>
          <dd className="mt-1 text-stone-900">{vendor.hoursNote ?? 'Horario del mercado'}</dd>
        </div>
      </dl>

      <section className="mt-10" aria-labelledby="vendor-how">
        <h2 id="vendor-how" className="text-xl font-semibold text-stone-900">
          Cómo comprar
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = STEP_ICON[step.key]
            return (
              <li key={step.key} className="rounded-xl border border-stone-200 bg-white p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs">
                    {index + 1}
                  </span>
                  <Icon className="h-4 w-4" aria-hidden />
                  {step.title}
                </p>
                <p className="mt-3 text-sm text-stone-600">{step.body}</p>
              </li>
            )
          })}
        </ol>
      </section>

      {vendor.gallery.length > 0 && (
        <section className="mt-10" aria-labelledby="vendor-gallery">
          <h2 id="vendor-gallery" className="text-xl font-semibold text-stone-900">
            El producto y el local
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {vendor.gallery.map((photo) => (
              <li key={photo.src}>
                <img
                  src={mercadoStaticSrc(photo.src)}
                  alt={photo.alt}
                  width={640}
                  height={480}
                  className="h-44 w-full rounded-xl object-cover ring-1 ring-stone-200"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <MercadoInscriptionCompactCta />

      <div className={styles.stickyReserve}>
        <VendorWhatsAppButton vendor={vendor} size="hero" />
      </div>
    </article>
  )
}
