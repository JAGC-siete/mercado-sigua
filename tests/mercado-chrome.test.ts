import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { marketOpenStatus, MERCADO_HOURS_ROWS } from '../lib/mercado/market-hours'
import { MERCADO_HOW_IT_WORKS_STEPS } from '../lib/mercado/how-it-works'

describe('mercado: horario oficial', () => {
  it('expone filas Lun–Vie, Sáb y Dom', () => {
    assert.equal(MERCADO_HOURS_ROWS.length, 3)
    assert.match(MERCADO_HOURS_ROWS[0]!.hours, /5:00/)
    assert.match(MERCADO_HOURS_ROWS[2]!.hours, /12:00/)
  })

  it('marca abierto un martes a media mañana', () => {
    // 2026-09-15 = Tuesday 10:00 Honduras (UTC-6) → 16:00Z
    const status = marketOpenStatus(new Date('2026-09-15T16:00:00.000Z'))
    assert.equal(status.open, true)
    assert.match(status.label, /abierto/i)
    assert.match(status.label, /4:00/)
  })

  it('marca cerrado un domingo a las 3 PM', () => {
    // 2026-09-13 = Sunday 15:00 Honduras → 21:00Z
    const status = marketOpenStatus(new Date('2026-09-13T21:00:00.000Z'))
    assert.equal(status.open, false)
    assert.match(status.label, /cerrado/i)
  })
})

describe('mercado: cómo funciona', () => {
  it('tiene 3 pasos de pickup', () => {
    assert.equal(MERCADO_HOW_IT_WORKS_STEPS.length, 3)
    assert.equal(MERCADO_HOW_IT_WORKS_STEPS[1]!.title, 'Pedí por WhatsApp')
  })
})
