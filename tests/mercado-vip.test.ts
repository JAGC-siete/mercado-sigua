import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  defaultVipExpiresAt,
  matchesVipFilter,
  resolveVipFields,
  vipBadgeKind,
  vipBadgeLabel,
} from '../lib/mercado/vip'

describe('mercado: VIP lifecycle', () => {
  it('default expiry es +1 año', () => {
    const from = new Date('2026-09-30T12:00:00.000Z')
    const iso = defaultVipExpiresAt(from)
    assert.equal(iso.slice(0, 10), '2027-09-30')
  })

  it('featured=true sin fecha → asigna default', () => {
    const resolved = resolveVipFields({ featured: true })
    assert.equal(resolved.featured, true)
    assert.ok(resolved.vip_expires_at)
  })

  it('featured=false limpia expiry', () => {
    const resolved = resolveVipFields({
      featured: false,
      previousExpiresAt: '2027-01-01T00:00:00.000Z',
    })
    assert.equal(resolved.featured, false)
    assert.equal(resolved.vip_expires_at, null)
  })

  it('clasifica badge vencido / por vencer', () => {
    const now = new Date('2026-09-30T12:00:00.000Z')
    assert.equal(vipBadgeKind(true, '2026-09-01T00:00:00.000Z', now), 'expired')
    assert.equal(vipBadgeKind(true, '2026-10-10T00:00:00.000Z', now), 'expiring')
    assert.equal(vipBadgeKind(true, '2027-09-30T00:00:00.000Z', now), 'active')
    assert.equal(vipBadgeKind(false, null, now), 'none')
    assert.match(vipBadgeLabel(true, '2026-09-01T00:00:00.000Z', now), /vencido/i)
  })

  it('filtra lista VIP', () => {
    const now = new Date('2026-09-30T12:00:00.000Z')
    assert.equal(matchesVipFilter(true, '2026-09-01T00:00:00.000Z', 'vip_expired', now), true)
    assert.equal(matchesVipFilter(true, '2026-10-10T00:00:00.000Z', 'vip_expiring', now), true)
    assert.equal(matchesVipFilter(false, null, 'vip_active', now), false)
  })
})
