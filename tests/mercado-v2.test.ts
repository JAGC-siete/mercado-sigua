import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { isPublicMercadoRoute, mercadoV2HomePath } from '../lib/mercado/paths'
import { isReservedVendorSlug } from '../lib/mercado/slug'
import {
  MERCADO_V2_AREAS,
  MERCADO_V2_COPY,
  MERCADO_V2_SEO,
  MERCADO_V2_STORY,
  mercadoV2AreasMatching,
  mercadoV2JsonLd,
  mercadoV2SearchHints,
  mercadoV2SitemapEntry,
} from '../lib/mercado/v2'

const v2Files = [
  'pages/mercadosanpablosiguav2/index.tsx',
  'components/mercado/MercadoV2Shell.tsx',
  'components/mercado/MercadoV2Chrome.tsx',
  'components/mercado/MercadoV2Hero.tsx',
  'components/mercado/MercadoV2SearchDialog.tsx',
  'components/mercado/MercadoV2Footer.tsx',
  'public/mercado/v2.css',
  'components/mercado/mv2.ts',
  'lib/mercado/v2.ts',
]

function v2Source() {
  return v2Files.map((file) => readFileSync(join(process.cwd(), file), 'utf8')).join('\n')
}

describe('mercado v2: ruta institucional', () => {
  it('vive en /mercadosanpablosiguav2', () => {
    assert.equal(mercadoV2HomePath(), '/mercadosanpablosiguav2')
    assert.equal(isPublicMercadoRoute('/mercadosanpablosiguav2'), true)
    assert.equal(isReservedVendorSlug('mercadosanpablosiguav2'), true)
  })

  it('no pisa el directorio v1', () => {
    assert.equal(isPublicMercadoRoute('/mercadosanpablosigua'), true)
    assert.notEqual(mercadoV2HomePath(), '/mercadosanpablosigua')
  })
})

describe('mercado v2: visita física, no directorio', () => {
  it('vende la visita presencial en hero y SEO', () => {
    assert.match(MERCADO_V2_SEO.heroLead, /colores, sabores y la frescura/i)
    assert.match(MERCADO_V2_SEO.heroLead, /corazón comercial de Siguatepeque/i)
    assert.match(MERCADO_V2_SEO.tagline, /corazón comercial de Siguatepeque/i)
    assert.equal(MERCADO_V2_SEO.title.includes('WhatsApp'), false)
    assert.equal(MERCADO_V2_SEO.description.includes('WhatsApp'), false)
    assert.equal(MERCADO_V2_COPY.h1, 'Mercado Municipal San Pablo')
    assert.equal(MERCADO_V2_COPY.heroDisplay, 'El corazón comercial de Siguatepeque')
  })

  it('muestra áreas del recinto, no puestos nombrados', () => {
    const titles = MERCADO_V2_AREAS.map((area) => area.title)
    assert.ok(titles.includes('Área de Comedores'))
    assert.ok(titles.includes('Frutas y Verduras'))
    assert.ok(titles.includes('Carnicería'))
    assert.ok(titles.includes('Abarrotes'))
    assert.ok(titles.includes('Ropa y telas'))
    for (const area of MERCADO_V2_AREAS) {
      assert.equal(/Doña|Don |El Patio|La Esquina|El Ahorro/i.test(area.title), false)
      assert.equal(/Doña|Don Chepe|El Patio/i.test(area.description), false)
      assert.equal(/WhatsApp|Pedir y Recoger/i.test(area.description), false)
    }
  })

  it('la búsqueda apunta a pasillo/área, no a un locatario', () => {
    const hints = mercadoV2SearchHints('Sopa')
    assert.ok(hints.some((hint) => /Pasillo 1/i.test(hint.label)))
    assert.equal(hints.some((hint) => /Patio|Lety|Carmen/i.test(hint.label)), false)
    const areas = mercadoV2AreasMatching('sopa')
    assert.deepEqual(areas.map((area) => area.id), ['comedores'])
    assert.equal(mercadoV2AreasMatching('res')[0]?.id, 'carniceria')
  })

  it('el cuerpo de la landing no recluta locatarios ni abre WhatsApp', () => {
    const source = v2Source()
    assert.equal(source.includes('Pedir y Recoger'), false)
    assert.equal(source.includes('wa.me'), false)
    assert.equal(source.includes('Inscribir mi puesto'), false)
    assert.equal(source.includes('¿Tenés puesto en el mercado?'), false)
    assert.equal(source.includes('Cómo aparece tu ficha'), false)
    assert.match(source, /Portal para locatarios/)
    assert.equal(MERCADO_V2_COPY.visitTitle, 'Cómo llegar')
    assert.equal(MERCADO_V2_COPY.findTitle, 'Lo que encontrarás')
    assert.match(MERCADO_V2_STORY.body, /economía de Siguatepeque/)
    assert.equal(/Doña|Don Chepe|El Patio|Lety|Carmen/i.test(MERCADO_V2_STORY.body), false)
    const page = readFileSync(join(process.cwd(), 'pages/mercadosanpablosiguav2/index.tsx'), 'utf8')
    const chrome = readFileSync(join(process.cwd(), 'components/mercado/MercadoV2Chrome.tsx'), 'utf8')
    const css = readFileSync(join(process.cwd(), 'public/mercado/v2.css'), 'utf8')
    const beneficios = page.indexOf('id="beneficios"')
    const encontraras = page.indexOf('id="encontraras"')
    const horarios = page.indexOf('id="horarios"')
    const visita = page.indexOf('id="visita"')
    assert.ok(beneficios > 0 && beneficios < encontraras)
    assert.ok(encontraras < horarios)
    assert.ok(horarios < visita)
    assert.equal(page.includes('<video'), false)
    assert.equal(page.includes('searchForm'), false)
    assert.match(page, /mercado\/v2\.css/)
    assert.equal(page.includes('fonts.googleapis'), false)
    assert.equal(css.includes('fonts.googleapis'), false)
    assert.match(css, /Iowan Old Style/)
    assert.match(css, /mv2KenBurns/)
    assert.match(chrome, /MercadoV2SearchDialog/)
    assert.match(source, /id="buscar"/)
  })

  it('JSON-LD es ShoppingCenter con departamentos, sin fichas de puesto', () => {
    const jsonLd = mercadoV2JsonLd()
    assert.equal(jsonLd['@type'], 'ShoppingCenter')
    assert.equal(jsonLd.containsPlace.length, MERCADO_V2_AREAS.length)
    assert.equal(
      jsonLd.containsPlace.some((place) => /Patio|Marta|Chepe/i.test(place.name)),
      false
    )
    assert.equal(mercadoV2SitemapEntry().loc, '/mercadosanpablosiguav2')
  })
})
