/** Fichas de prueba. Solo para tests: el sitio ya no pinta datos de ejemplo. */

import type { PublicVendorCard } from '../../lib/mercado/schema'

export const PATIO_FIXTURE: PublicVendorCard = {
  slug: 'comedor-el-patio',
  name: 'Comedor El Patio',
  category: 'comida',
  description: 'Caldo de res y tortillas hechas a mano. Pide por WhatsApp y recoge en el local 8.',
  whatsapp: null,
  logoUrl: '/mercado/dona-carmen.png',
  stallLocation: 'Pasillo 1, local 8',
  hoursNote: 'Lun–Sáb 6:00–15:00',
  products: ['Caldo de res', 'Sopa de mondongo', 'Plato del día', 'Tortillas hechas a mano', 'Café de olla'],
  paymentMethods: ['efectivo', 'transferencia_bac'],
  gallery: [{ src: '/mercado/comedor-el-patio-plato.png', alt: 'Caldo de res y tortillas' }],
  featured: true,
}

export const CARNICERIA_FIXTURE: PublicVendorCard = {
  slug: 'carniceria-la-esquina',
  name: 'Carnicería La Esquina',
  category: 'carnes',
  description: 'Cortes frescos para la carne asada. Pide por WhatsApp y asegura tu pedido con una transferencia.',
  whatsapp: null,
  logoUrl: '/mercado/carniceria-la-esquina.png',
  stallLocation: 'Ala de carnes, local 2',
  hoursNote: 'Lun–Sáb 6:00–13:00',
  products: ['Lomo de res', 'Costilla de cerdo', 'Carne para asar', 'Molida fresca', 'Pollo entero'],
  paymentMethods: ['efectivo', 'transferencia_bac'],
  gallery: [],
  featured: false,
}
