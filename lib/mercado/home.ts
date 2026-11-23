/** Marca del sitio. Todo el copy público lee el nombre y el dominio de aquí. */
export const MERCADO_SEO = {
  name: 'Mercado Digital de Siguatepeque',
  domain: 'sigua-online.com',
  title: 'Mercado Digital de Siguatepeque | Negocios locales por WhatsApp',
  description:
    'Encuentra negocios de Siguatepeque y escríbeles directo por WhatsApp: comida, mercado, ropa, servicios y más. Sin intermediarios.',
  city: 'Siguatepeque',
  region: 'Comayagua',
  country: 'HN',
  tagline:
    'Los negocios de Siguatepeque, directo a tu WhatsApp. Busca lo que necesitas y escríbele al dueño, sin intermediarios.',
  heroImage: '/mercado/pasillo-san-pablo.png',
} as const

/** El Mercado Municipal San Pablo: un lugar dentro del directorio, con su propia página. */
export const SAN_PABLO_MARKET = {
  name: 'Mercado Municipal San Pablo',
  shortName: 'Mercado San Pablo',
  addressLine: 'A 100 metros de la Plaza la Amistad, Siguatepeque, Comayagua',
  streetAddress: 'Mercado Municipal San Pablo, 100 m de Plaza la Amistad',
} as const

/** Mercado San Pablo: 14° 35′ 52″ N, 87° 49′ 52″ O */
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
  h1: 'Mercado Digital de Siguatepeque: los negocios de la ciudad, directo en tu WhatsApp',
  introTitle: 'Compra local en el "Cerro de las Mujeres"',
  introBody:
    'Siguatepeque vive de su comercio: el mercado, las tiendas del centro, los comedores y los servicios de cada barrio. Aquí los encuentras en un solo lugar.',
  directoryTitle: 'Negocios de Siguatepeque',
  directoryBody:
    'Cada mensaje por WhatsApp le llega directo al negocio, no a un intermediario. El pedido, el pago y la entrega los acuerdas con el dueño.',
  emptyDirectory:
    'Todavía estamos sumando negocios al directorio. Si tienes uno en Siguatepeque, inscríbelo gratis y aparece aquí.',
  howToBuyTitle: '¿Cómo comprar sin hacer fila?',
  howToBuyBody:
    'Escríbele al negocio por WhatsApp, confirma tu pedido y pasa a recogerlo cuando te avisen que está listo.',
  sanPabloTitle: 'Mercado Municipal San Pablo',
  sanPabloBody:
    'El corazón comercial de Siguatepeque, a pasos de la Plaza la Amistad. Conoce sus áreas, horarios y cómo llegar.',
  sanPabloCta: 'Conocer el Mercado San Pablo',
} as const
