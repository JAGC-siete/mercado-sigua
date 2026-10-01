import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MERCADO_ADMIN_COOKIE } from '../lib/mercado/admin-auth'
import { rewritePathForHost } from '../lib/hosts'

describe('mercado: host y cookie', () => {
  it('abre el directorio en /', () => {
    assert.equal(rewritePathForHost('mercado.humanosisu.net', '/'), '/mercadosanpablosigua')
    assert.equal(rewritePathForHost('localhost', '/'), '/mercadosanpablosigua')
    assert.equal(rewritePathForHost('mercado.humanosisu.net', '/app/mercado/login'), null)
    assert.equal(rewritePathForHost('mercado.humanosisu.net', '/mercadosanpablosigua'), null)
  })

  it('usa cookie propia del operador municipal', () => {
    assert.equal(MERCADO_ADMIN_COOKIE, 'mercado_op')
  })
})
