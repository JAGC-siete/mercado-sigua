import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  canLoginToApp,
  normalizeLoginEmail,
  normalizeLoginPassword,
  postLoginPath,
} from '../lib/auth/role-access'
import { APP_LOGIN_PATH, appLoginPath } from '../lib/mercado/paths'
import { MERCADO_ADMIN_COOKIE } from '../lib/mercado/admin-auth'

describe('auth: role access mercado', () => {
  it('normaliza email y password', () => {
    assert.equal(normalizeLoginEmail('  Foo@Bar.COM '), 'foo@bar.com')
    assert.equal(normalizeLoginPassword('  secret\u200B '), 'secret')
  })

  it('solo super_admin y vendor activos pueden entrar', () => {
    assert.equal(canLoginToApp('super_admin', true), true)
    assert.equal(canLoginToApp('vendor', true), true)
    assert.equal(canLoginToApp('vendor', false), false)
    assert.equal(canLoginToApp('hr_manager', true), false)
  })

  it('redirige post-login por rol', () => {
    assert.equal(postLoginPath('super_admin', null), '/app/mercado/fichas')
    assert.equal(postLoginPath('super_admin', '/app/mercado/solicitudes'), '/app/mercado/solicitudes')
    assert.equal(postLoginPath('vendor', '/app/mercado/fichas'), '/app')
  })

  it('login canónico y cookie HMAC residual documentada', () => {
    assert.equal(APP_LOGIN_PATH, '/app/login')
    assert.equal(appLoginPath('/app/mercado'), '/app/login?redirect=%2Fapp%2Fmercado')
    assert.equal(MERCADO_ADMIN_COOKIE, 'mercado_op')
  })
})
