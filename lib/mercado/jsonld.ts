import { VENDOR_CATEGORIES, type VendorCategory } from './categories'
import { MERCADO_GEO, MERCADO_SEO, SAN_PABLO_MARKET } from './home'
import { mercadoHomeCanonical, mercadoVendorCanonical, mercadoAssetUrl } from './meta'
import {
  mercadoCategoryPath,
  mercadoHomePath,
  mercadoInscriptionPath,
  mercadoV2HomePath,
  mercadoVendorPath,
} from './paths'
import { mercadoAbsoluteUrl } from './public-url'
import { parseHoursWindow } from './stall-status'
import { vendorWhatsAppDigits } from './whatsapp'
import type { PublicVendorCard } from './schema'

const SCHEMA_WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

export function vendorSchemaType(category: VendorCategory) {
  switch (category) {
    case 'comida':
      return 'FoodEstablishment'
    case 'verduras':
    case 'frutas':
    case 'granos':
    case 'abarrotes':
      return 'GroceryStore'
    case 'ropa':
      return 'ClothingStore'
    case 'calzado':
      return 'ShoeStore'
    case 'artesanias':
      return 'Store'
    default:
      return 'LocalBusiness'
  }
}

function padClock(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function openingHoursSpecification(hoursNote: string | null) {
  const window = parseHoursWindow(hoursNote)
  if (!window) return undefined
  const dayOfWeek = window.closedSunday ? SCHEMA_WEEKDAYS.slice(0, 6) : [...SCHEMA_WEEKDAYS]
  return [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek,
      opens: padClock(window.startMin),
      closes: padClock(window.endMin),
    },
  ]
}

export function schemaTelephone(whatsapp: string | null) {
  if (!whatsapp) return undefined
  const digits = vendorWhatsAppDigits(whatsapp)
  if (digits.length === 8) return `+504${digits}`
  if (digits.startsWith('504') && digits.length >= 11) return `+${digits}`
  if (digits.length >= 8) return `+${digits}`
  return undefined
}

/** @id del ShoppingCenter que publica la página del Mercado San Pablo (lib/mercado/v2.ts). */
export function mercadoPlaceId() {
  return `${mercadoAbsoluteUrl(mercadoV2HomePath())}#mercado`
}

export function vendorPlaceId(slug: string) {
  return `${mercadoVendorCanonical(slug)}#negocio`
}

/** La home es el directorio de la ciudad: WebSite + lista de negocios, no un ShoppingCenter. */
export function mercadoDirectoryJsonLd(vendors: PublicVendorCard[]) {
  const home = mercadoHomeCanonical()
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${home}#sitio`,
        name: MERCADO_SEO.name,
        description: MERCADO_SEO.description,
        url: home,
        inLanguage: 'es-HN',
        image: mercadoAssetUrl(MERCADO_SEO.heroImage),
      },
      {
        '@type': 'ItemList',
        '@id': `${home}#negocios`,
        name: `Negocios de ${MERCADO_SEO.city}`,
        itemListElement: vendors.map((vendor, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: vendor.name,
          url: mercadoVendorCanonical(vendor.slug),
        })),
      },
    ],
  }
}

export function mercadoVendorJsonLd(vendor: PublicVendorCard) {
  const category = vendor.category as VendorCategory
  const telephone = schemaTelephone(vendor.whatsapp)
  const image = mercadoAssetUrl(vendor.logoUrl)
  const hours = openingHoursSpecification(vendor.hoursNote)

  return {
    '@context': 'https://schema.org',
    '@type': vendorSchemaType(category),
    '@id': vendorPlaceId(vendor.slug),
    name: vendor.name,
    description: vendor.description,
    url: mercadoVendorCanonical(vendor.slug),
    ...(image ? { image } : {}),
    ...(telephone ? { telephone } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: vendor.stallLocation
        ? `${SAN_PABLO_MARKET.name}, ${vendor.stallLocation}`
        : SAN_PABLO_MARKET.streetAddress,
      addressLocality: MERCADO_SEO.city,
      addressRegion: MERCADO_SEO.region,
      addressCountry: MERCADO_SEO.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: MERCADO_GEO.latitude,
      longitude: MERCADO_GEO.longitude,
    },
    hasMap: MERCADO_GEO.mapsUrl,
    ...(hours ? { openingHoursSpecification: hours } : {}),
    ...(vendor.products.length
      ? {
          makesOffer: vendor.products.map((name) => ({
            '@type': 'Offer',
            name,
            itemOffered: {
              '@type': 'Product',
              name,
            },
            availability: 'https://schema.org/InStoreOnly',
          })),
        }
      : {}),
    ...(vendor.paymentMethods.length
      ? {
          acceptedPaymentMethod: vendor.paymentMethods.map((method) =>
            method === 'efectivo' ? 'https://schema.org/Cash' : 'https://schema.org/ByBankTransferInAdvance'
          ),
        }
      : {}),
    containedInPlace: {
      '@type': 'ShoppingCenter',
      '@id': mercadoPlaceId(),
      name: SAN_PABLO_MARKET.name,
      url: mercadoAbsoluteUrl(mercadoV2HomePath()),
    },
    areaServed: {
      '@type': 'City',
      name: MERCADO_SEO.city,
    },
  }
}

export function mercadoSitemapUrls(vendorSlugs: string[] = []) {
  const today = new Date().toISOString().split('T')[0]
  const slugs = vendorSlugs

  return [
    {
      loc: mercadoHomePath(),
      changefreq: 'daily' as const,
      priority: 0.9,
      lastmod: today,
    },
    {
      loc: mercadoInscriptionPath(),
      changefreq: 'monthly' as const,
      priority: 0.6,
      lastmod: today,
    },
    ...VENDOR_CATEGORIES.map((category) => ({
      loc: mercadoCategoryPath(category),
      changefreq: 'weekly' as const,
      priority: 0.7,
      lastmod: today,
    })),
    ...slugs.map((slug) => ({
      loc: mercadoVendorPath(slug),
      changefreq: 'daily' as const,
      priority: 0.8,
      lastmod: today,
    })),
  ]
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
