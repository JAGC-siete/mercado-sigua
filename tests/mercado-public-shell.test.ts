import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { MERCADO_GEO, MERCADO_SEO, SAN_PABLO_MARKET } from '../lib/mercado/home'
import { vendorBuySteps } from '../lib/mercado/buy-flow'
import { isPublicMercadoRoute, mercadoHomePath, mercadoVendorPath } from '../lib/mercado/paths'
import { MERCADO_DIRECTORY_WHATSAPP, vendorReservationHref, vendorWhatsAppHref } from '../lib/mercado/whatsapp'
import { mercadoStaticSrc } from '../lib/mercado/assets'
import { CARNICERIA_FIXTURE } from './fixtures/vendors'

describe('mercado: shell público', () => {
  it('sirve el directorio en / y las fichas en /negocios', () => {
    assert.equal(mercadoHomePath(), '/')
    assert.equal(mercadoVendorPath('comedor-el-patio'), '/negocios/comedor-el-patio')
    assert.equal(isPublicMercadoRoute('/'), true)
    assert.equal(isPublicMercadoRoute('/inscripcion'), true)
    assert.equal(isPublicMercadoRoute('/negocios/comedor-el-patio'), true)
    assert.equal(isPublicMercadoRoute('/mercado-san-pablo'), true)
    assert.equal(isPublicMercadoRoute('/app/mercado'), false)
    assert.equal(isPublicMercadoRoute('/mercaderia'), false)
  })

  it('cache-bustea png de /mercado para no heredar un 308 viejo', () => {
    assert.equal(mercadoStaticSrc('/mercado/dona-marta.png'), '/mercado/dona-marta.png?v=2')
    assert.equal(mercadoStaticSrc('/otro.png'), '/otro.png')
  })

  it('home pone #negocios antes que #categorias y no trae datos de ejemplo', () => {
    const home = readFileSync(join(process.cwd(), 'pages/index.tsx'), 'utf8')
    const negocios = home.indexOf('id="negocios"')
    const categorias = home.indexOf('id="categorias"')
    assert.ok(negocios > 0)
    assert.ok(categorias > 0)
    assert.ok(negocios < categorias)
    assert.match(home, /MERCADO_HOME_COPY.directoryTitle/)
    assert.match(home, /MERCADO_HOME_COPY.emptyDirectory/)
    assert.match(home, /MERCADO_HOME_COPY.h1/)
    assert.match(home, /id="como-comprar"/)
    assert.match(home, /id="mercado-search"/)
    assert.match(home, /id="mercado-san-pablo"/)
    assert.equal(home.includes('mercado-header-search'), false)
    assert.equal(/PREVIEW|SearchHints|FEATURED_GROUPS/.test(home), false)
    assert.match(home, /styles\.categoryStrip/)
  })

  it('shell navega Negocios → Categorías → Mercado San Pablo', () => {
    const shell = readFileSync(join(process.cwd(), 'components/mercado/MercadoPublicShell.tsx'), 'utf8')
    assert.equal(shell.includes('headerSearch'), false)
    assert.equal(shell.includes('mercado-header-search'), false)
    const negocios = shell.indexOf("homeAnchor('negocios')")
    const categorias = shell.indexOf("homeAnchor('categorias')")
    const sanPablo = shell.indexOf('mercadoV2HomePath()')
    assert.ok(negocios > 0)
    assert.ok(negocios < categorias)
    assert.ok(categorias < sanPablo)
  })

  it('hero queda sticky bajo el chrome y el CSS no deja headerSearch', () => {
    const css = readFileSync(join(process.cwd(), 'components/mercado/mercado.module.css'), 'utf8')
    assert.equal(css.includes('.headerSearch'), false)
    assert.match(css, /\.hero\s*\{[^}]*position:\s*sticky/)
    assert.match(css, /top:\s*var\(--mercado-chrome-h\)/)
    assert.match(css, /\.homeSection\s*\{[^}]*scroll-margin-top/)
    assert.match(css, /\.searchHints\s*\{[^}]*max-height/)
    assert.match(css, /\.categoryStrip\s*\{[^}]*overflow-x:\s*auto/)
    assert.match(css, /\.categoryIcon\s*\{[^}]*border-radius:\s*999px/)
  })
})

describe('mercado: marca y WhatsApp', () => {
  it('usa la marca nueva y deja San Pablo como lugar dentro del sitio', () => {
    assert.equal(MERCADO_SEO.name, 'Mercado Digital de Siguatepeque')
    assert.equal(MERCADO_SEO.domain, 'sigua-online.com')
    assert.match(MERCADO_SEO.tagline, /WhatsApp/)
    assert.equal(/San Pablo|Municipal/.test(MERCADO_SEO.title + MERCADO_SEO.description), false)
    assert.match(SAN_PABLO_MARKET.addressLine, /Plaza la Amistad/)
    assert.match(MERCADO_GEO.howToArrive, /Escenario al Aire Libre/)
    assert.equal(MERCADO_GEO.latitude, 14.597778)
    assert.equal(MERCADO_GEO.longitude, -87.831111)
  })

  it('explica comprar en 3 pasos con recoger en el local', () => {
    const steps = vendorBuySteps(CARNICERIA_FIXTURE)
    assert.equal(steps.length, 3)
    assert.equal(steps[0]?.title, 'Escríbenos')
    assert.match(steps[1]?.body ?? '', /BAC/)
    assert.match(steps[2]?.body ?? '', /local 2/)
    assert.match(steps[2]?.body ?? '', /^Pasa /)
  })

  it('arma wa.me sin inventar el número y nombra el sitio', () => {
    const href = vendorWhatsAppHref('9999-0000', 'Comedor El Patio')
    assert.match(href, /^https:\/\/wa\.me\/50499990000\?text=/)
    assert.match(href, /sigua-online\.com/)
  })

  it('reserva por el WhatsApp del directorio y nombra productos y local', () => {
    const href = vendorReservationHref(CARNICERIA_FIXTURE)
    assert.match(href, new RegExp(`wa\\.me/${MERCADO_DIRECTORY_WHATSAPP}\\?text=`))
    assert.match(href, /vengo%20de%20sigua-online\.com/)
    assert.match(href, /Lomo/)
    assert.match(href, /local%202/)
  })
})
