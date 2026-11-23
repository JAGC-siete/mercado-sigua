import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { MERCADO_ADMIN_COOKIE } from '../lib/mercado/admin-auth'
import { canonicalHostname, currentPathForLegacy, redirectTargetFor } from '../lib/hosts'

const PROD = 'https://sigua-online.com'

describe('hosts: rutas de la marca anterior', () => {
  it('manda cada ruta vieja a su ruta nueva', () => {
    assert.equal(currentPathForLegacy('/mercadosanpablosigua'), '/')
    assert.equal(currentPathForLegacy('/mercadosanpablosigua/'), '/')
    assert.equal(currentPathForLegacy('/mercadosanpablosigua/inscripcion'), '/inscripcion')
    assert.equal(currentPathForLegacy('/mercadosanpablosigua/comedor-el-patio'), '/negocios/comedor-el-patio')
    assert.equal(currentPathForLegacy('/mercadosanpablosiguav2'), '/mercado-san-pablo')
    assert.equal(currentPathForLegacy('/mercado'), '/')
    assert.equal(currentPathForLegacy('/mercado/inscripcion'), '/inscripcion')
    assert.equal(currentPathForLegacy('/mercado/comedor-el-patio'), '/negocios/comedor-el-patio')
  })

  it('no toca rutas actuales ni los png de public/mercado', () => {
    assert.equal(currentPathForLegacy('/'), null)
    assert.equal(currentPathForLegacy('/negocios/comedor-el-patio'), null)
    assert.equal(currentPathForLegacy('/mercado-san-pablo'), null)
    assert.equal(currentPathForLegacy('/mercado/dona-marta.png'), null)
    assert.equal(currentPathForLegacy('/mercado/v2.css'), null)
    assert.equal(currentPathForLegacy('/mercaderia'), null)
    assert.equal(currentPathForLegacy('/app/mercado'), null)
  })
})

describe('hosts: cambio de dominio', () => {
  it('lee el host canónico de NEXT_PUBLIC_SITE_URL y lo ignora en local', () => {
    assert.equal(canonicalHostname(PROD), 'sigua-online.com')
    assert.equal(canonicalHostname('http://localhost:3000'), null)
    assert.equal(canonicalHostname(undefined), null)
    assert.equal(canonicalHostname('no es url'), null)
  })

  it('redirige el dominio viejo en un solo salto, mapeando la ruta', () => {
    assert.deepEqual(redirectTargetFor('mercado.humanosisu.net', '/mercadosanpablosigua/comedor-el-patio', PROD), {
      origin: PROD,
      pathname: '/negocios/comedor-el-patio',
    })
    assert.deepEqual(redirectTargetFor('mercado.humanosisu.net', '/app/login', PROD), {
      origin: PROD,
      pathname: '/app/login',
    })
    assert.deepEqual(redirectTargetFor('www.sigua-online.com', '/', PROD), { origin: PROD, pathname: '/' })
  })

  it('no redirige APIs ni assets de Next en el dominio viejo', () => {
    assert.equal(redirectTargetFor('mercado.humanosisu.net', '/api/auth/login', PROD), null)
    assert.equal(redirectTargetFor('mercado.humanosisu.net', '/_next/data/x.json', PROD), null)
  })

  it('no saca a nadie del dominio mientras NEXT_PUBLIC_SITE_URL siga en el viejo', () => {
    const old = 'https://mercado.humanosisu.net'
    assert.equal(redirectTargetFor('mercado.humanosisu.net', '/', old), null)
    assert.deepEqual(redirectTargetFor('mercado.humanosisu.net', '/mercadosanpablosigua', old), {
      origin: null,
      pathname: '/',
    })
  })

  it('no redirige hosts desconocidos (healthcheck de Railway, localhost)', () => {
    assert.equal(redirectTargetFor('healthcheck.railway.app', '/api/health', PROD), null)
    assert.equal(redirectTargetFor('localhost:3000', '/', PROD), null)
    assert.equal(redirectTargetFor('sigua-online.com', '/', PROD), null)
  })

  it('las 301 viven en middleware, no en next.config.js', () => {
    const config = readFileSync(join(process.cwd(), 'next.config.js'), 'utf8')
    assert.equal(config.includes('redirects()'), false)
    const middleware = readFileSync(join(process.cwd(), 'middleware.ts'), 'utf8')
    assert.match(middleware, /redirectTargetFor/)
    assert.match(middleware, /301/)
  })

  it('usa cookie propia del operador', () => {
    assert.equal(MERCADO_ADMIN_COOKIE, 'mercado_op')
  })
})
