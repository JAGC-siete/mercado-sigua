import type { PublicVendorCard } from './schema'
import type { VendorCategory } from './categories'
import { DEFAULT_VENDOR_PAYMENT_METHODS } from './schema'

export const MERCADO_SEO = {
  name: 'Mercado Municipal San Pablo',
  title: 'Mercado Municipal San Pablo | Productos Locales de Siguatepeque por WhatsApp',
  description:
    'Descubre la herencia agrícola del "Cerro de las Mujeres". Verduras, frutas y carnes del Mercado San Pablo, Siguatepeque, por WhatsApp. Cero intermediarios.',
  city: 'Siguatepeque',
  region: 'Comayagua',
  country: 'HN',
  addressLine: 'A 100 metros de la Plaza la Amistad, Siguatepeque, Comayagua',
  tagline:
    'Todo lo fresco del Mercado San Pablo, directo a tu WhatsApp. Desde el caldo de res levantamuertos hasta la verdura recién cortada. ¿De qué tienes ganas hoy?',
  trustBanner: 'Apoyando el comercio local de Siguatepeque. Tradición que se reinventa para ti.',
  heroImage: '/mercado/pasillo-san-pablo.png',
} as const

/** 14° 35′ 52″ N, 87° 49′ 52″ O */
export const MERCADO_GEO = {
  label: '14° 35′ 52″ N, 87° 49′ 52″ O',
  latitude: 14.597778,
  longitude: -87.831111,
  landmark: 'Escenario al Aire Libre y Plaza la Amistad',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=14.597778%2C-87.831111',
  howToArrive:
    'El Mercado Municipal San Pablo está en el corazón comercial de Siguatepeque, a pasos del Escenario al Aire Libre y la Plaza la Amistad.',
} as const

export const MERCADO_HOME_COPY = {
  h1: 'Mercado Municipal San Pablo: El Corazón Agrícola de Siguatepeque, Directo en tu WhatsApp',
  traditionTitle: 'Tradición Centenaria del "Cerro de las Mujeres"',
  traditionBody:
    'Siguatepeque — el Cerro de las Mujeres — vive de la tierra. En el Mercado San Pablo esa cosecha llega al pasillo: verdura del día, fruta madura y el caldo que ya conocés.',
  producerTitle: 'Apoya al Productor Local: Del Campo Hondureño a tu Mesa',
  producerBody:
    'Cada pedido por WhatsApp va al locatario, no a un intermediario. Apartás con transferencia o efectivo y recogés en el puesto. El campo hondureño se paga en la mesa.',
  howToBuyTitle: '¿Cómo Comprar en el Mercado San Pablo Sin Hacer Fila?',
  howToBuyBody:
    'Pedí por WhatsApp, confirmá el pedido y pasá a recoger al local. El locatario te tiene el mandado listo; no hay que hacer fila en la caja.',
} as const

export const MERCADO_FEATURED_GROUPS = [
  {
    heading: 'Verduras y Frutas Frescas',
    slugs: ['verduras-dona-marta', 'frutas-don-chepe'],
  },
  {
    heading: 'Carnes y Cortes Diarios',
    slugs: ['carniceria-la-esquina'],
  },
  {
    heading: 'Caldos y Comida Tradicional',
    slugs: ['comedor-el-patio'],
  },
] as const

function gallery(
  items: Array<{ src: string; alt: string }>
): PublicVendorCard['gallery'] {
  return items
}

/**
 * Catálogo de arranque para pintar Home y perfiles hasta que el admin publique filas en `vendors`.
 * WhatsApp del locatario queda null a propósito: no se inventan números de puesto.
 * El CTA de reserva usa MERCADO_DIRECTORY_WHATSAPP.
 */
export const MERCADO_HOME_PREVIEW_VENDORS: PublicVendorCard[] = [
  {
    slug: 'comedor-el-patio',
    name: 'Comedor El Patio',
    category: 'comida',
    description:
      'Caldo de res hirviendo y tortillas que te queman las manos. Pedí a Doña Carmen por WhatsApp, apartá tu plato y pasá recogiéndolo al local 8 sin hacer fila.',
    whatsapp: null,
    logoUrl: '/mercado/dona-carmen.png',
    stallLocation: 'Pasillo 1, local 8',
    hoursNote: 'Lun–Sáb 6:00–15:00',
    products: ['Caldo de res', 'Sopa de mondongo', 'Plato del día', 'Tortillas hechas a mano', 'Café de olla'],
    paymentMethods: [...DEFAULT_VENDOR_PAYMENT_METHODS],
    gallery: gallery([
      { src: '/mercado/comedor-el-patio-plato.png', alt: 'Caldo de res y tortillas en Comedor El Patio' },
      { src: '/mercado/comedor-el-patio-local.png', alt: 'Fachada del Comedor El Patio en el mercado' },
      { src: '/mercado/dona-carmen.png', alt: 'Doña Carmen en el Comedor El Patio' },
    ]),
    featured: true,
  },
  {
    slug: 'verduras-dona-marta',
    name: 'Verduras Doña Marta',
    category: 'verduras',
    description:
      'Tomates rojitos, chiles vivos y el culantro para la sopa. Pedí a Doña Marta por WhatsApp, confirmá con transferencia o efectivo, y pasá a recoger a la mesa 14.',
    whatsapp: null,
    logoUrl: '/mercado/dona-marta.png',
    stallLocation: 'Pasillo de verduras, mesa 14',
    hoursNote: 'Lun–Sáb 5:30–14:00',
    products: ['Tomate', 'Chile jalapeño', 'Culantro', 'Cebolla', 'Papa'],
    paymentMethods: [...DEFAULT_VENDOR_PAYMENT_METHODS],
    gallery: gallery([
      { src: '/mercado/verduras-dona-marta-mesa.png', alt: 'Mesa de tomate, chile y culantro de Doña Marta' },
      { src: '/mercado/verduras-dona-marta-local.png', alt: 'Puesto de verduras de Doña Marta' },
      { src: '/mercado/dona-marta.png', alt: 'Doña Marta en su mesa de verduras' },
    ]),
    featured: true,
  },
  {
    slug: 'frutas-don-chepe',
    name: 'Frutas Don Chepe',
    category: 'frutas',
    description:
      'Piña jugosa, banano madurito y sandía fría. Pedí a Don Chepe por WhatsApp, confirmá el pedido y pasá recogiéndolo a la mesa 3, ya cortado.',
    whatsapp: null,
    logoUrl: '/mercado/don-chepe.png',
    stallLocation: 'Pasillo de frutas, mesa 3',
    hoursNote: 'Lun–Sáb 5:30–14:00',
    products: ['Piña', 'Banano', 'Sandía', 'Mango', 'Naranja'],
    paymentMethods: [...DEFAULT_VENDOR_PAYMENT_METHODS],
    gallery: gallery([
      { src: '/mercado/frutas-don-chepe-fruta.png', alt: 'Piña, banano y sandía en el puesto de Don Chepe' },
      { src: '/mercado/frutas-don-chepe-local.png', alt: 'Fachada del puesto de frutas de Don Chepe' },
      { src: '/mercado/don-chepe.png', alt: 'Don Chepe en su puesto de frutas' },
    ]),
    featured: true,
  },
  {
    slug: 'carniceria-la-esquina',
    name: 'Carnicería La Esquina',
    category: 'carnes',
    description:
      'Cortes frescos para la carnita asada del domingo, directo del gancho. Pedí temprano por WhatsApp, asegurá tu lomo con una transferencia, y pasá recogiéndolo directo al local sin hacer fila.',
    whatsapp: null,
    logoUrl: '/mercado/carniceria-la-esquina.png',
    stallLocation: 'Ala de carnes, local 2',
    hoursNote: 'Lun–Sáb 6:00–13:00',
    products: ['Lomo de res', 'Costilla de cerdo', 'Carne para asar', 'Molida fresca', 'Pollo entero'],
    paymentMethods: [...DEFAULT_VENDOR_PAYMENT_METHODS],
    gallery: gallery([
      { src: '/mercado/carniceria-la-esquina-cortes.png', alt: 'Cortes frescos de res, cerdo y pollo' },
      { src: '/mercado/carniceria-la-esquina-local.png', alt: 'Fachada de Carnicería La Esquina, local 2' },
      { src: '/mercado/carniceria-la-esquina.png', alt: 'Carnicería La Esquina en el Mercado San Pablo' },
    ]),
    featured: true,
  },
  {
    slug: 'ropa-pasillo-central',
    name: 'Ropa Pasillo Central',
    category: 'ropa',
    description:
      'Uniformes que aguantan el recreo, telas por yarda y ropa de diario. Pedí talla y tela por WhatsApp, apartá con transferencia y pasá a recoger al local 21.',
    whatsapp: null,
    logoUrl: '/mercado/ropa-pasillo-central.png',
    stallLocation: 'Pasillo central, local 21',
    hoursNote: 'Lun–Sáb 8:00–16:00',
    products: ['Uniformes escolares', 'Camisetas de diario', 'Tela por yarda', 'Pantalón de trabajo', 'Blusas'],
    paymentMethods: [...DEFAULT_VENDOR_PAYMENT_METHODS],
    gallery: gallery([
      { src: '/mercado/ropa-pasillo-central-tela.png', alt: 'Telas, uniformes y ropa de diario' },
      { src: '/mercado/ropa-pasillo-central-local.png', alt: 'Puesto de ropa en el pasillo central' },
      { src: '/mercado/ropa-pasillo-central.png', alt: 'Ropa Pasillo Central en el mercado' },
    ]),
    featured: true,
  },
  {
    slug: 'abarrotes-el-ahorro',
    name: 'Abarrotes El Ahorro',
    category: 'abarrotes',
    description:
      'Frijol, arroz, aceite y el detergente del mes. Pedí el mandado por WhatsApp, pagá con transferencia BAC o efectivo, y recogé en el local 5.',
    whatsapp: null,
    logoUrl: '/mercado/abarrotes-el-ahorro.png',
    stallLocation: 'Pasillo 4, local 5',
    hoursNote: 'Lun–Sáb 7:00–17:00',
    products: ['Frijol', 'Arroz', 'Aceite', 'Azúcar', 'Detergente'],
    paymentMethods: [...DEFAULT_VENDOR_PAYMENT_METHODS],
    gallery: gallery([
      { src: '/mercado/abarrotes-el-ahorro-anaquel.png', alt: 'Frijol, arroz, aceite y detergente en El Ahorro' },
      { src: '/mercado/abarrotes-el-ahorro-local.png', alt: 'Fachada de Abarrotes El Ahorro' },
      { src: '/mercado/abarrotes-el-ahorro.png', alt: 'Abarrotes El Ahorro en el mercado' },
    ]),
    featured: true,
  },
]

export const MERCADO_SEARCH_HINTS = [
  {
    needles: ['sop', 'sopa', 'mondongo', 'lety'],
    label: 'Sopa de mondongo donde Doña Lety (Quedan 3 platos)',
    slug: 'comedor-el-patio',
  },
  {
    needles: ['cald', 'caldo', 'res', 'carmen', 'tortilla'],
    label: 'Caldo de res hirviendo en El Patio — Doña Carmen',
    slug: 'comedor-el-patio',
  },
  {
    needles: ['tom', 'tomate', 'culantro', 'marta', 'chile', 'verdura'],
    label: 'Tomates rojitos de Doña Marta (recién cortados)',
    slug: 'verduras-dona-marta',
  },
  {
    needles: ['piña', 'pina', 'banano', 'sandia', 'sandía', 'fruta', 'chepe'],
    label: 'Piña y sandía fría con Don Chepe',
    slug: 'frutas-don-chepe',
  },
  {
    needles: ['carne', 'carnita', 'asada', 'lomo', 'cerdo'],
    label: 'Carnita asada del domingo, directo del gancho',
    slug: 'carniceria-la-esquina',
  },
] as const

export function mercadoSearchHints(query: string) {
  const needle = query.trim().toLowerCase()
  if (needle.length < 2) return []
  return MERCADO_SEARCH_HINTS.filter((hint) =>
    hint.needles.some((token) => token.startsWith(needle) || needle.startsWith(token) || token.includes(needle))
  ).slice(0, 4)
}

export function previewVendorsByCategory(category?: VendorCategory | null): PublicVendorCard[] {
  if (!category) return MERCADO_HOME_PREVIEW_VENDORS
  return MERCADO_HOME_PREVIEW_VENDORS.filter((vendor) => vendor.category === category)
}

export function findPreviewVendor(slug: string): PublicVendorCard | null {
  const normalized = slug.toLowerCase().trim()
  return MERCADO_HOME_PREVIEW_VENDORS.find((vendor) => vendor.slug === normalized) ?? null
}
