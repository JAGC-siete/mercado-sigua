import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  sortVendorsForDirectory,
  vendorRowToPublicCard,
  type VendorRow,
} from '../lib/mercado/vendors-db'
import {
  vendorReadyForPickupMessage,
  vendorReservationMessage,
} from '../lib/mercado/whatsapp'
import { VENDOR_APPLICATION_STATUSES } from '../lib/mercado/inscription-schema'

const baseRow: VendorRow = {
  id: '00000000-0000-4000-8000-000000000001',
  application_id: null,
  name: 'Carnicería La Esquina',
  slug: 'carniceria-la-esquina',
  description: 'Cortes frescos en el pasillo de carnes del mercado.',
  category: 'carnes',
  whatsapp: '9999-1111',
  status: 'active',
  logo_url: '/mercado/carniceria-la-esquina-local.png',
  stall_location: 'Pasillo carnes, local 3',
  hours_note: 'Lun–Sáb 6:00–14:00',
  featured: true,
  products: ['Lomo', 'Costilla', 'Molida'],
  payment_methods: ['efectivo', 'transferencia_bac'],
  gallery: [{ src: '/mercado/carniceria-la-esquina-cortes.png', alt: 'Cortes' }],
}

describe('mercado: vendors-db mapping', () => {
  it('mapea fila DB a tarjeta pública', () => {
    const card = vendorRowToPublicCard(baseRow)
    assert.ok(card)
    assert.equal(card?.slug, 'carniceria-la-esquina')
    assert.equal(card?.featured, true)
    assert.equal(card?.gallery.length, 1)
    assert.deepEqual(card?.paymentMethods, ['efectivo', 'transferencia_bac'])
  })

  it('ordena destacados primero', () => {
    const a = vendorRowToPublicCard({ ...baseRow, featured: false, name: 'Zeta' })!
    const b = vendorRowToPublicCard({ ...baseRow, featured: true, name: 'Alfa', slug: 'alfa' })!
    const sorted = sortVendorsForDirectory([a, b])
    assert.equal(sorted[0]?.name, 'Alfa')
  })
})

describe('mercado: whatsapp pickup templates', () => {
  it('incluye hint de perecedero en carnes', () => {
    const msg = vendorReservationMessage({
      name: 'Carnicería La Esquina',
      stallLocation: 'Pasillo carnes',
      products: ['Lomo'],
      category: 'carnes',
    })
    assert.match(msg, /vengo del directorio San Pablo/i)
    assert.match(msg, /reservar|pedir/i)
    assert.match(msg, /corte/i)
  })

  it('plantilla listo para recoger', () => {
    const msg = vendorReadyForPickupMessage({
      name: 'Carnicería La Esquina',
      stallLocation: 'Pasillo carnes',
    })
    assert.match(msg, /listo/i)
    assert.match(msg, /BAC/i)
  })
})

describe('mercado: application statuses', () => {
  it('incluye approved y reviewed', () => {
    assert.ok(VENDOR_APPLICATION_STATUSES.includes('approved'))
    assert.ok(VENDOR_APPLICATION_STATUSES.includes('reviewed'))
  })
})
