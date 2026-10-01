import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Card, CardContent } from '../ui/card'
import VendorWhatsAppButton from './VendorWhatsAppButton'
import { VENDOR_CATEGORY_LABEL, type VendorCategory } from '../../lib/mercado/categories'
import { mercadoVendorPath } from '../../lib/mercado/paths'
import { mercadoStaticSrc } from '../../lib/mercado/assets'
import { stallStatusLabel } from '../../lib/mercado/stall-status'
import type { PublicVendorCard } from '../../lib/mercado/schema'
import styles from './mercado.module.css'

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export default function VendorCard({
  vendor,
  titleAs = 'h3',
}: {
  vendor: PublicVendorCard
  titleAs?: 'h3' | 'p'
}) {
  const category = vendor.category as VendorCategory
  const status = stallStatusLabel({ category, hoursNote: vendor.hoursNote })
  const live = status.startsWith('Abierto') || status.startsWith('Recibiendo')
  const TitleTag = titleAs

  return (
    <Card className={`${styles.vendorCard} group flex h-full flex-col`}>
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start gap-4">
          {vendor.logoUrl ? (
            <img
              src={mercadoStaticSrc(vendor.logoUrl)}
              alt={vendor.name}
              width={80}
              height={80}
              className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-[#c4a574] ring-offset-2"
            />
          ) : (
            <div
              aria-hidden
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#efe6d8] text-lg font-bold text-[#2a1810] ring-2 ring-[#c4a574] ring-offset-2"
            >
              {initials(vendor.name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <Badge className="w-fit border border-[#e7e0d4] bg-[#efe6d8] text-[#2a1810]">
                {VENDOR_CATEGORY_LABEL[category]}
              </Badge>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  live ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {status}
              </span>
            </div>
            <Link href={mercadoVendorPath(vendor.slug)} className="mt-2 block">
              <TitleTag className="text-xl font-bold text-[#2a1810] group-hover:underline">{vendor.name}</TitleTag>
            </Link>
          </div>
        </div>
        <p className="line-clamp-4 flex-1 text-sm leading-relaxed text-stone-600">{vendor.description}</p>
        {vendor.products.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {vendor.products.slice(0, 5).map((product) => (
              <li
                key={product}
                className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700"
              >
                {product}
              </li>
            ))}
          </ul>
        )}
        {vendor.stallLocation && (
          <p className="flex items-center gap-2 text-sm text-stone-500">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            {vendor.stallLocation}
          </p>
        )}
        <VendorWhatsAppButton vendor={vendor} />
      </CardContent>
    </Card>
  )
}
