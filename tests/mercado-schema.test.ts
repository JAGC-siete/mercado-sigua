import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseCreateVendor, parseUpdateVendor } from '../lib/mercado/schema'
import { slugifyVendorName } from '../lib/mercado/slug'

const valid = {
  name: 'Comedor El Patio',
  category: 'comida',
  description: 'Comida corrida y caldo de res en el pasillo de comedores.',
  whatsapp: '9999-0000',
  products: ['Caldo de res', 'Sopa de mondongo', 'Plato del día', 'Tortillas hechas a mano', 'Café de olla'],
}

describe('mercado: alta de vendedor', () => {
  it('acepta nombre, categoría, descripción y WhatsApp, y genera slug', () => {
    const parsed = parseCreateVendor(valid)
    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.slug, 'comedor-el-patio')
      assert.equal(parsed.data.status, 'active')
      assert.equal(parsed.data.featured, false)
    }
  })

  it('omite logo, ubicación y horario vacíos', () => {
    const parsed = parseCreateVendor({
      ...valid,
      slug: 'comedor-el-patio',
      logoUrl: '  ',
      stallLocation: '',
      hoursNote: '  ',
    })
    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.logoUrl, undefined)
      assert.equal(parsed.data.stallLocation, undefined)
      assert.equal(parsed.data.hoursNote, undefined)
    }
  })

  it('guarda ubicación y logo cuando vienen llenos', () => {
    const parsed = parseCreateVendor({
      ...valid,
      stallLocation: 'Pasillo 1, local 8',
      logoUrl: '/mercado/comedor-el-patio.webp',
      hoursNote: 'Lun–Sáb 6:00–15:00',
    })
    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.stallLocation, 'Pasillo 1, local 8')
      assert.equal(parsed.data.logoUrl, '/mercado/comedor-el-patio.webp')
    }
  })

  it('rechaza WhatsApp incompleto', () => {
    const parsed = parseCreateVendor({ ...valid, whatsapp: '12' })
    assert.equal(parsed.success, false)
  })

  it('rechaza categoría inexistente', () => {
    const parsed = parseCreateVendor({ ...valid, category: 'nomina' })
    assert.equal(parsed.success, false)
  })

  it('rechaza slug reservado', () => {
    const parsed = parseCreateVendor({ ...valid, slug: 'admin' })
    assert.equal(parsed.success, false)
  })

  it('rechaza logo http', () => {
    const parsed = parseCreateVendor({ ...valid, logoUrl: 'http://example.com/logo.png' })
    assert.equal(parsed.success, false)
  })

  it('exige al menos un producto principal', () => {
    const parsed = parseCreateVendor({ ...valid, products: ['', '  '] })
    assert.equal(parsed.success, false)
  })

  it('guarda productos y pagos BAC', () => {
    const parsed = parseCreateVendor(valid)
    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.products.length, 5)
      assert.deepEqual(parsed.data.paymentMethods, ['efectivo', 'transferencia_bac'])
    }
  })
})

describe('mercado: edición', () => {
  it('exige al menos un campo', () => {
    const parsed = parseUpdateVendor({})
    assert.equal(parsed.success, false)
  })

  it('acepta cambio de estado', () => {
    const parsed = parseUpdateVendor({ status: 'inactive' })
    assert.equal(parsed.success, true)
  })
})

describe('mercado: slug', () => {
  it('normaliza acentos y espacios', () => {
    assert.equal(slugifyVendorName('Verduras Doña Marta'), 'verduras-dona-marta')
  })
})
