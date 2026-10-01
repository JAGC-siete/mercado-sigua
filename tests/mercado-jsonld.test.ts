import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MERCADO_HOME_PREVIEW_VENDORS } from '../lib/mercado/home'
import {
  mercadoSitemapUrls,
  mercadoVendorJsonLd,
  schemaTelephone,
  vendorSchemaType,
} from '../lib/mercado/jsonld'
import { clampMetaDescription, mercadoHomeDescription, mercadoHomeTitle, mercadoVendorTitle } from '../lib/mercado/meta'

describe('mercado: JSON-LD de perfil', () => {
  it('marca el comedor como FoodEstablishment anidado en el mercado', () => {
    const patio = MERCADO_HOME_PREVIEW_VENDORS.find((vendor) => vendor.slug === 'comedor-el-patio')
    assert.ok(patio)
    const jsonLd = mercadoVendorJsonLd(patio)
    assert.equal(jsonLd['@type'], 'FoodEstablishment')
    assert.equal(jsonLd.name, 'Comedor El Patio')
    assert.equal(jsonLd.address.addressLocality, 'Siguatepeque')
    assert.equal(jsonLd.geo.latitude, 14.597778)
    assert.equal(jsonLd.containedInPlace['@type'], 'ShoppingCenter')
    assert.ok(!('telephone' in jsonLd))
    assert.equal(jsonLd.openingHoursSpecification?.[0]?.opens, '06:00')
    assert.equal(jsonLd.openingHoursSpecification?.[0]?.closes, '15:00')
    assert.equal(jsonLd.makesOffer?.length, 5)
    assert.ok(jsonLd.acceptedPaymentMethod?.includes('https://schema.org/Cash'))
    assert.ok(jsonLd.acceptedPaymentMethod?.includes('https://schema.org/ByBankTransferInAdvance'))
  })

  it('no inventa teléfono si el WhatsApp no está publicado', () => {
    assert.equal(schemaTelephone(null), undefined)
    assert.equal(schemaTelephone('9999-0000'), '+50499990000')
  })

  it('elige GroceryStore para verduras', () => {
    assert.equal(vendorSchemaType('verduras'), 'GroceryStore')
  })
})

describe('mercado: metadata y sitemap', () => {
  it('acorta meta a 155 y arma title de específico a general', () => {
    assert.equal(
      mercadoHomeTitle(),
      'Mercado Municipal San Pablo | Productos Locales de Siguatepeque por WhatsApp'
    )
    assert.ok(mercadoHomeTitle().length <= 76)
    assert.ok(mercadoHomeDescription().length <= 155)
    assert.match(mercadoHomeDescription(), /Cerro de las Mujeres/)
    assert.match(mercadoHomeDescription(), /WhatsApp/)
    assert.equal(
      mercadoVendorTitle({ name: 'Comedor El Patio', category: 'comida' }),
      'Comedor El Patio - Comida Corrida en Mercado San Pablo, Siguatepeque'
    )
    assert.ok(clampMetaDescription('x'.repeat(200)).length <= 155)
  })

  it('lista home, categorías y cada puesto público', () => {
    const locs = mercadoSitemapUrls().map((entry) => entry.loc)
    assert.ok(locs.includes('/mercadosanpablosigua'))
    assert.ok(locs.includes('/mercadosanpablosigua/inscripcion'))
    assert.ok(locs.includes('/mercadosanpablosigua?categoria=verduras'))
    assert.ok(locs.includes('/mercadosanpablosigua/comedor-el-patio'))
    assert.ok(locs.includes('/mercadosanpablosigua/verduras-dona-marta'))
    assert.equal(locs.some((loc) => loc.startsWith('/app/')), false)
  })
})
