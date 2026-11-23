import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CARNICERIA_FIXTURE, PATIO_FIXTURE } from './fixtures/vendors'
import {
  mercadoDirectoryJsonLd,
  mercadoSitemapUrls,
  mercadoVendorJsonLd,
  schemaTelephone,
  vendorSchemaType,
} from '../lib/mercado/jsonld'
import { clampMetaDescription, mercadoHomeDescription, mercadoHomeTitle, mercadoVendorTitle } from '../lib/mercado/meta'

describe('mercado: JSON-LD de perfil', () => {
  it('marca el comedor como FoodEstablishment anidado en el Mercado San Pablo', () => {
    const jsonLd = mercadoVendorJsonLd(PATIO_FIXTURE)
    assert.equal(jsonLd['@type'], 'FoodEstablishment')
    assert.equal(jsonLd.name, 'Comedor El Patio')
    assert.equal(jsonLd.address.addressLocality, 'Siguatepeque')
    assert.equal(jsonLd.geo.latitude, 14.597778)
    assert.equal(jsonLd.containedInPlace['@type'], 'ShoppingCenter')
    assert.equal(jsonLd.containedInPlace.name, 'Mercado Municipal San Pablo')
    assert.match(jsonLd.containedInPlace['@id'], /\/mercado-san-pablo#mercado$/)
    assert.match(jsonLd.url, /\/negocios\/comedor-el-patio$/)
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

  it('la home es un WebSite con la lista de negocios, no un ShoppingCenter', () => {
    const jsonLd = mercadoDirectoryJsonLd([PATIO_FIXTURE, CARNICERIA_FIXTURE])
    const [site, list] = jsonLd['@graph']
    assert.equal(site['@type'], 'WebSite')
    assert.equal(site.name, 'Mercado Digital de Siguatepeque')
    assert.equal(list['@type'], 'ItemList')
    assert.equal(list.itemListElement.length, 2)
    assert.equal(list.itemListElement[0]?.position, 1)
    assert.equal(mercadoDirectoryJsonLd([])['@graph'][1].itemListElement.length, 0)
  })
})

describe('mercado: metadata y sitemap', () => {
  it('acorta meta a 155 y arma title de específico a general', () => {
    assert.equal(
      mercadoHomeTitle(),
      'Mercado Digital de Siguatepeque | Negocios locales por WhatsApp'
    )
    assert.ok(mercadoHomeTitle().length <= 76)
    assert.ok(mercadoHomeDescription().length <= 155)
    assert.equal(mercadoHomeDescription().endsWith('…'), false)
    assert.match(mercadoHomeDescription(), /Siguatepeque/)
    assert.match(mercadoHomeDescription(), /WhatsApp/)
    assert.equal(
      mercadoVendorTitle({ name: 'Comedor El Patio', category: 'comida' }),
      'Comedor El Patio - Comida Corrida en Siguatepeque | Mercado Digital de Siguatepeque'
    )
    assert.ok(clampMetaDescription('x'.repeat(200)).length <= 155)
  })

  it('lista home, categorías y cada negocio público', () => {
    const locs = mercadoSitemapUrls(['comedor-el-patio', 'verduras-dona-marta']).map((entry) => entry.loc)
    assert.ok(locs.includes('/'))
    assert.ok(locs.includes('/inscripcion'))
    assert.ok(locs.includes('/?categoria=verduras'))
    assert.ok(locs.includes('/negocios/comedor-el-patio'))
    assert.ok(locs.includes('/negocios/verduras-dona-marta'))
    assert.equal(locs.some((loc) => loc.startsWith('/app/')), false)
    assert.equal(mercadoSitemapUrls().some((entry) => entry.loc.startsWith('/negocios/')), false)
  })
})
