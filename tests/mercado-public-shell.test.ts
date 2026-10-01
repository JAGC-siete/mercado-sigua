import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { MERCADO_GEO, MERCADO_HOME_PREVIEW_VENDORS, MERCADO_SEO, mercadoSearchHints } from '../lib/mercado/home'
import { vendorBuySteps } from '../lib/mercado/buy-flow'
import { isPublicMercadoRoute, mercadoHomePath, mercadoVendorPath } from '../lib/mercado/paths'
import { MERCADO_DIRECTORY_WHATSAPP, vendorReservationHref, vendorWhatsAppHref } from '../lib/mercado/whatsapp'
import { mercadoStaticSrc } from '../lib/mercado/assets'

describe('mercado: shell público', () => {
  it('conserva las rutas canónicas del directorio', () => {
    assert.equal(mercadoHomePath(), '/mercadosanpablosigua')
    assert.equal(mercadoVendorPath('comedor-el-patio'), '/mercadosanpablosigua/comedor-el-patio')
    assert.equal(isPublicMercadoRoute('/mercadosanpablosigua'), true)
    assert.equal(isPublicMercadoRoute('/mercadosanpablosigua/inscripcion'), true)
    assert.equal(isPublicMercadoRoute('/mercadosanpablosigua/comedor-el-patio'), true)
    assert.equal(isPublicMercadoRoute('/mercado'), true)
    assert.equal(isPublicMercadoRoute('/mercado/inscripcion'), true)
    assert.equal(isPublicMercadoRoute('/mercaderia'), false)
  })

  it('el 301 de /mercado no se lleva los png de public/mercado', () => {
    const config = readFileSync(join(process.cwd(), 'next.config.js'), 'utf8')
    assert.match(config, /\/mercado\/:path\(\(\?!\.\*\\\\.\)\.\*\)/)
    assert.equal(config.includes("source: '/mercado/:path*'"), false)
  })

  it('cache-bustea png de /mercado para no heredar un 308 viejo', () => {
    assert.equal(mercadoStaticSrc('/mercado/dona-marta.png'), '/mercado/dona-marta.png?v=2')
    assert.equal(mercadoStaticSrc('/otro.png'), '/otro.png')
  })

  it('home pone #puestos antes que #categorias', () => {
    const home = readFileSync(join(process.cwd(), 'pages/mercadosanpablosigua/index.tsx'), 'utf8')
    const puestos = home.indexOf('id="puestos"')
    const categorias = home.indexOf('id="categorias"')
    assert.ok(puestos > 0)
    assert.ok(categorias > 0)
    assert.ok(puestos < categorias)
    assert.match(home, /MERCADO_HOME_COPY.producerTitle/)
    assert.match(home, /MERCADO_HOME_COPY.h1/)
    assert.match(home, /id="como-comprar"/)
    assert.match(home, /id="mercado-search"/)
    assert.equal(home.includes('mercado-header-search'), false)
    assert.match(home, /styles\.categoryStrip/)
  })

  it('shell quita el buscador del header y navega Puestos → Categorías → Ubicación', () => {
    const shell = readFileSync(join(process.cwd(), 'components/mercado/MercadoPublicShell.tsx'), 'utf8')
    assert.equal(shell.includes('headerSearch'), false)
    assert.equal(shell.includes('mercado-header-search'), false)
    const puestos = shell.indexOf("homeAnchor('puestos')")
    const categorias = shell.indexOf("homeAnchor('categorias')")
    const ubicacion = shell.indexOf("homeAnchor('ubicacion')")
    assert.ok(puestos > 0)
    assert.ok(puestos < categorias)
    assert.ok(categorias < ubicacion)
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

describe('mercado: copy San Pablo y WhatsApp', () => {
  it('nombra el mercado San Pablo y ancla Plaza la Amistad', () => {
    assert.match(MERCADO_SEO.name, /San Pablo/)
    assert.match(MERCADO_SEO.addressLine, /Plaza la Amistad/)
    assert.match(MERCADO_SEO.tagline, /WhatsApp/)
    assert.match(MERCADO_GEO.howToArrive, /Escenario al Aire Libre/)
    assert.equal(MERCADO_GEO.latitude, 14.597778)
    assert.equal(MERCADO_GEO.longitude, -87.831111)
  })

  it('pone copy de calle y retrato en los puestos destacados', () => {
    const patio = MERCADO_HOME_PREVIEW_VENDORS.find((vendor) => vendor.slug === 'comedor-el-patio')
    const marta = MERCADO_HOME_PREVIEW_VENDORS.find((vendor) => vendor.slug === 'verduras-dona-marta')
    assert.ok(patio)
    assert.ok(marta)
    assert.match(patio.description, /Doña Carmen/)
    assert.match(marta.description, /Doña Marta/)
    assert.equal(marta.logoUrl, '/mercado/dona-marta.png')
    assert.equal(patio.whatsapp, null)
  })

  it('deja cada mini landing con rubro, 5 productos y galería', () => {
    for (const vendor of MERCADO_HOME_PREVIEW_VENDORS) {
      assert.equal(vendor.products.length, 5)
      assert.ok(vendor.paymentMethods.includes('efectivo'))
      assert.ok(vendor.paymentMethods.includes('transferencia_bac'))
      assert.equal(vendor.gallery.length, 3)
      assert.equal(vendor.whatsapp, null)
    }
    const carniceria = MERCADO_HOME_PREVIEW_VENDORS.find((vendor) => vendor.slug === 'carniceria-la-esquina')
    assert.ok(carniceria)
    assert.ok(carniceria.products.includes('Lomo de res'))
    assert.match(carniceria.description, /WhatsApp/)
    assert.match(carniceria.description, /transferencia/)
  })

  it('explica comprar en 3 pasos con recoger en el local', () => {
    const carniceria = MERCADO_HOME_PREVIEW_VENDORS.find((vendor) => vendor.slug === 'carniceria-la-esquina')
    assert.ok(carniceria)
    const steps = vendorBuySteps(carniceria)
    assert.equal(steps.length, 3)
    assert.equal(steps[0]?.title, 'Escríbenos')
    assert.match(steps[1]?.body ?? '', /BAC/)
    assert.match(steps[2]?.body ?? '', /local 2/)
  })

  it('sugiere antojo al teclear sopa', () => {
    const hints = mercadoSearchHints('Sop')
    assert.ok(hints.some((hint) => /mondongo/i.test(hint.label)))
  })

  it('arma wa.me sin inventar el número', () => {
    const href = vendorWhatsAppHref('9999-0000', 'Comedor El Patio')
    assert.match(href, /^https:\/\/wa\.me\/50499990000\?text=/)
    assert.match(href, /San%20Pablo/)
  })

  it('reserva por el WhatsApp del directorio y nombra productos y local', () => {
    const carniceria = MERCADO_HOME_PREVIEW_VENDORS.find((vendor) => vendor.slug === 'carniceria-la-esquina')
    assert.ok(carniceria)
    const href = vendorReservationHref(carniceria)
    assert.match(href, new RegExp(`wa\\.me/${MERCADO_DIRECTORY_WHATSAPP}\\?text=`))
    assert.match(href, /vengo%20del%20directorio%20San%20Pablo/)
    assert.match(href, /Lomo/)
    assert.match(href, /local%202/)
  })
})
