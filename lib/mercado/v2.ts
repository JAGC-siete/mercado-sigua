/**
 * Copy y datos de la landing institucional v2.
 * Visita física al recinto. Sin puestos nombrados ni CTA de WhatsApp.
 */

import { MERCADO_GEO, MERCADO_SEO } from './home'
import { MERCADO_MARKET_HOURS } from './market-hours'
import { mercadoV2HomePath } from './paths'
import { mercadoAbsoluteUrl } from './public-url'
import { mercadoStaticSrc } from './assets'

export const MERCADO_V2_SEO = {
  name: MERCADO_SEO.name,
  title: 'Mercado Municipal San Pablo | Visita el corazón comercial de Siguatepeque',
  description:
    'Descubre colores, sabores y frescura en el Mercado San Pablo. Frutas, verduras, carnes, comida y abarrotes en el corazón de Siguatepeque.',
  tagline:
    'El corazón comercial de Siguatepeque. Encuentra frescura, variedad y tradición en un solo lugar.',
  heroLead:
    'El corazón comercial de Siguatepeque. Descubre los colores, sabores y la frescura del Mercado San Pablo, a pasos de la Plaza la Amistad.',
  heroImage: MERCADO_SEO.heroImage,
} as const

export const MERCADO_V2_COPY = {
  h1: 'Mercado Municipal San Pablo',
  heroDisplay: 'El corazón comercial de Siguatepeque',
  enterCta: 'Entrar al recinto',
  findTitle: 'Lo que encontrarás',
  findBody:
    'Recorré las áreas del recinto. Cada pasillo junta a muchos locatarios: lo que ves es la oferta del mercado, no un puesto en particular.',
  visitTitle: 'Cómo llegar',
  visitBody: MERCADO_GEO.howToArrive,
  hoursTitle: 'Horario de atención',
  hoursCompact: 'Lun–Sáb 5–4 · Dom 6–12',
  benefitsTitle: 'Por qué venir al mercado',
  searchTitle: '¿Qué querés encontrar?',
  searchPlaceholder: 'Ej. sopa, tomate, carne',
  searchHint: 'Te indicamos el pasillo o el área. La compra se hace en el recinto.',
  discover: 'Descubrir',
  catalogClear: 'Ver todo el recinto',
  mapsCta: 'Ver cómo llegar',
  hoursCta: 'Conocé nuestros horarios',
  locatariosPortal: 'Portal para locatarios',
} as const

export const MERCADO_V2_STORY = {
  kicker: 'La madrugada llega primero',
  body:
    'Antes de que abra la plaza, el recinto ya huele a caldo, a cilantro recién cortado y a carbón. Aquí se mueve la economía de Siguatepeque: productor, locatario y vecino, bajo el mismo techo municipal. Venir al mercado no es pasar a un anaquel: es recorrer el corazón de la ciudad.',
  photos: [
    {
      src: '/mercado/verduras-dona-marta-mesa.png',
      alt: 'Tomate, chile y culantro frescos en el Mercado San Pablo',
    },
    {
      src: '/mercado/comedor-el-patio-plato.png',
      alt: 'Caldo y tortillas en el área de comedores del mercado',
    },
  ],
} as const

export type MercadoV2AreaId =
  | 'comedores'
  | 'frutas-verduras'
  | 'carniceria'
  | 'abarrotes'
  | 'ropa'

export interface MercadoV2Area {
  id: MercadoV2AreaId
  title: string
  aisle: string
  description: string
  image: string
  imageAlt: string
  cta: string
  schemaType: 'FoodEstablishment' | 'GroceryStore' | 'ButcherShop' | 'ClothingStore'
}

export const MERCADO_V2_AREAS: MercadoV2Area[] = [
  {
    id: 'comedores',
    title: 'Área de Comedores',
    aisle: 'Pasillo 1',
    description:
      'Caldo del día, tortillas al comal y el plato corrido que se pide solo. Varios fogones, una sola área para sentarte a comer en el mercado.',
    image: '/mercado/comedor-el-patio-plato.png',
    imageAlt: 'Caldo y tortillas en el área de comedores del Mercado San Pablo',
    cta: 'Descubre nuestra gastronomía',
    schemaType: 'FoodEstablishment',
  },
  {
    id: 'frutas-verduras',
    title: 'Frutas y Verduras',
    aisle: 'Pasillo de verduras y frutas',
    description:
      'Tomate, chile, culantro, piña y banano del día. La cosecha llega al pasillo: frescura y variedad de toda el área, no de un solo puesto.',
    image: '/mercado/verduras-dona-marta-mesa.png',
    imageAlt: 'Mesa de verduras frescas en el Mercado Municipal San Pablo',
    cta: 'Ver ubicación del área',
    schemaType: 'GroceryStore',
  },
  {
    id: 'carniceria',
    title: 'Carnicería',
    aisle: 'Ala de carnes',
    description:
      'Cortes de res, cerdo y pollo para la olla o la parrilla. Carne del día en el ala de carnes, con la variedad que junta el recinto.',
    image: '/mercado/carniceria-la-esquina-cortes.png',
    imageAlt: 'Cortes frescos de res, cerdo y pollo en la carnicería del mercado',
    cta: 'Ver ubicación del área',
    schemaType: 'ButcherShop',
  },
  {
    id: 'abarrotes',
    title: 'Abarrotes',
    aisle: 'Pasillo 4',
    description:
      'Frijol, arroz, aceite, azúcar y el mandado seco del mes. Precios de recinto y anaquel completo en el pasillo de abarrotes.',
    image: '/mercado/abarrotes-el-ahorro-anaquel.png',
    imageAlt: 'Anaquel de granos, aceite y abarrotes en el Mercado San Pablo',
    cta: 'Ver ubicación del área',
    schemaType: 'GroceryStore',
  },
  {
    id: 'ropa',
    title: 'Ropa y telas',
    aisle: 'Pasillo central',
    description:
      'Ropa de diario, uniformes y tela por yarda. El pasillo central reúne variedad para la casa y el trabajo.',
    image: '/mercado/ropa-pasillo-central-tela.png',
    imageAlt: 'Telas y ropa de diario en el pasillo central del mercado',
    cta: 'Ver ubicación del área',
    schemaType: 'ClothingStore',
  },
]

export const MERCADO_V2_SEARCH_HINTS = [
  {
    needles: ['sop', 'sopa', 'mondongo', 'cald', 'caldo', 'almuerzo', 'comida', 'tortilla'],
    label: 'Sopa, caldo y comida corrida · Pasillo 1, Área de Comedores',
    areaId: 'comedores' as const,
  },
  {
    needles: ['tom', 'tomate', 'culantro', 'chile', 'verdura', 'papa', 'cebolla'],
    label: 'Verdura del día · Pasillo de verduras',
    areaId: 'frutas-verduras' as const,
  },
  {
    needles: ['piña', 'pina', 'banano', 'sandia', 'sandía', 'fruta', 'mango', 'naranja'],
    label: 'Fruta fresca · Pasillo de frutas',
    areaId: 'frutas-verduras' as const,
  },
  {
    needles: ['carne', 'carnita', 'asada', 'lomo', 'cerdo', 'pollo', 'res'],
    label: 'Cortes del día · Ala de carnes',
    areaId: 'carniceria' as const,
  },
  {
    needles: ['frijol', 'arroz', 'aceite', 'azucar', 'azúcar', 'detergente', 'abarrotes', 'mandado'],
    label: 'Mandado seco · Pasillo 4, Abarrotes',
    areaId: 'abarrotes' as const,
  },
  {
    needles: ['ropa', 'tela', 'uniforme', 'camisa', 'pantalon', 'pantalón'],
    label: 'Ropa y telas · Pasillo central',
    areaId: 'ropa' as const,
  },
] as const

export interface MercadoV2Benefit {
  title: string
  body: string
  mark: string
}

export const MERCADO_V2_BENEFITS: MercadoV2Benefit[] = [
  {
    title: 'Economía local',
    body: 'La compra queda en Siguatepeque: productor, locatario y recinto municipal.',
    mark: '01',
  },
  {
    title: 'Precios de recinto',
    body: 'Variedad de puestos en el mismo pasillo. Comparás y llevás al precio del mercado.',
    mark: '02',
  },
  {
    title: 'Frescura del día',
    body: 'Verdura, fruta y carne que llegan al pasillo por la mañana.',
    mark: '03',
  },
  {
    title: 'Todo en un lugar',
    body: 'Comida, abarrotes, ropa y frescos bajo el mismo techo.',
    mark: '04',
  },
  {
    title: 'Centro de la ciudad',
    body: 'A 100 metros de la Plaza la Amistad, junto al Escenario al Aire Libre.',
    mark: '05',
  },
  {
    title: 'Abierto toda la semana',
    body: 'Lunes a sábado 5:00 AM – 4:00 PM. Domingo 6:00 AM – 12:00 PM.',
    mark: '06',
  },
]

export function mercadoV2SearchHints(query: string) {
  const needle = query.trim().toLowerCase()
  if (needle.length < 2) return []
  return MERCADO_V2_SEARCH_HINTS.filter((hint) =>
    hint.needles.some(
      (token) => token.startsWith(needle) || needle.startsWith(token) || token.includes(needle)
    )
  ).slice(0, 4)
}

export function mercadoV2AreasMatching(query: string): MercadoV2Area[] {
  const needle = query.trim().toLowerCase()
  if (needle.length < 2) return [...MERCADO_V2_AREAS]
  const ids = new Set(
    MERCADO_V2_SEARCH_HINTS.filter((hint) =>
      hint.needles.some(
        (token) => token.startsWith(needle) || needle.startsWith(token) || token.includes(needle)
      )
    ).map((hint) => hint.areaId)
  )
  if (ids.size > 0) return MERCADO_V2_AREAS.filter((area) => ids.has(area.id))
  return MERCADO_V2_AREAS.filter((area) => {
    const haystack = `${area.title} ${area.aisle}`.toLowerCase()
    return haystack.includes(needle)
  })
}

export function mercadoV2HomeCanonical() {
  return mercadoAbsoluteUrl(mercadoV2HomePath())
}

function padClock(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function mercadoV2JsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ShoppingCenter',
    '@id': `${mercadoV2HomeCanonical()}#mercado`,
    name: MERCADO_SEO.name,
    description: MERCADO_V2_SEO.description,
    url: mercadoV2HomeCanonical(),
    image: mercadoAbsoluteUrl(mercadoStaticSrc(MERCADO_V2_SEO.heroImage)),
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Mercado Municipal San Pablo, 100 m de Plaza la Amistad',
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
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: padClock(MERCADO_MARKET_HOURS.weekday.openMin),
        closes: padClock(MERCADO_MARKET_HOURS.weekday.closeMin),
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: padClock(MERCADO_MARKET_HOURS.saturday.openMin),
        closes: padClock(MERCADO_MARKET_HOURS.saturday.closeMin),
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: padClock(MERCADO_MARKET_HOURS.sunday.openMin),
        closes: padClock(MERCADO_MARKET_HOURS.sunday.closeMin),
      },
    ],
    containsPlace: MERCADO_V2_AREAS.map((area) => ({
      '@type': area.schemaType,
      name: area.title,
      description: area.description,
    })),
  }
}

export function serializeMercadoV2JsonLd() {
  return JSON.stringify(mercadoV2JsonLd()).replace(/</g, '\\u003c')
}

export function mercadoV2SitemapEntry() {
  return {
    loc: mercadoV2HomePath(),
    changefreq: 'weekly' as const,
    priority: 0.8,
    lastmod: new Date().toISOString().split('T')[0],
  }
}
