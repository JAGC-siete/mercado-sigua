export const VENDOR_CATEGORIES = [
  'comida',
  'verduras',
  'frutas',
  'carnes',
  'granos',
  'abarrotes',
  'ropa',
  'calzado',
  'artesanias',
  'servicios',
  'otros',
] as const

export type VendorCategory = (typeof VENDOR_CATEGORIES)[number]

export const VENDOR_CATEGORY_LABEL: Record<VendorCategory, string> = {
  comida: 'Comida',
  verduras: 'Verduras',
  frutas: 'Frutas',
  carnes: 'Carnes',
  granos: 'Granos',
  abarrotes: 'Abarrotes',
  ropa: 'Ropa',
  calzado: 'Calzado',
  artesanias: 'Artesanías',
  servicios: 'Servicios',
  otros: 'Otros',
}

export const VENDOR_CATEGORY_BLURB: Record<VendorCategory, string> = {
  comida: 'Caldo levantamuertos, tortillas al comal y el plato del día.',
  verduras: 'Tomates rojitos, chiles vivos y el culantro para la sopa.',
  frutas: 'Piña jugosa, banano madurito y sandía que se pide sola.',
  carnes: 'Cortes frescos para la carnita asada del domingo, directo del gancho.',
  granos: 'Maíz, frijol y arroz que rinden la olla.',
  abarrotes: 'El mandado seco: aceite, jabón y lo que se acaba en la casa.',
  ropa: 'Ropa de diario, uniformes y telas que se tocan.',
  calzado: 'Zapatos que caminan el mercado y compostura al momento.',
  artesanias: 'Hecho a mano, para llevar un pedazo del pueblo.',
  servicios: 'Lo que se arregla adentro del mercado, sin irte lejos.',
  otros: 'El puesto raro que siempre extrañás.',
}

export function isVendorCategory(value: unknown): value is VendorCategory {
  return typeof value === 'string' && (VENDOR_CATEGORIES as readonly string[]).includes(value)
}
