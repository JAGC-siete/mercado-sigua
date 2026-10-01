/**
 * Horario oficial del Mercado Municipal San Pablo (reloj Honduras).
 * Fuente única para barra de estado, footer y copy operativo.
 */

import { HONDURAS_TIMEZONE } from '../timezone'

export type MarketDayKey = 'weekday' | 'saturday' | 'sunday'

export interface MarketDayHours {
  label: string
  openMin: number
  closeMin: number
  /** Texto humano, ej. 5:00 AM – 4:00 PM */
  display: string
}

/** Lun–Vie y Sáb 5:00–16:00; Dom 6:00–12:00 (hora Honduras). */
export const MERCADO_MARKET_HOURS: Record<MarketDayKey, MarketDayHours> = {
  weekday: {
    label: 'Lunes a viernes',
    openMin: 5 * 60,
    closeMin: 16 * 60,
    display: '5:00 AM – 4:00 PM',
  },
  saturday: {
    label: 'Sábados',
    openMin: 5 * 60,
    closeMin: 16 * 60,
    display: '5:00 AM – 4:00 PM',
  },
  sunday: {
    label: 'Domingos',
    openMin: 6 * 60,
    closeMin: 12 * 60,
    display: '6:00 AM – 12:00 PM',
  },
}

export const MERCADO_HOURS_ROWS: Array<{ days: string; hours: string }> = [
  { days: MERCADO_MARKET_HOURS.weekday.label, hours: MERCADO_MARKET_HOURS.weekday.display },
  { days: MERCADO_MARKET_HOURS.saturday.label, hours: MERCADO_MARKET_HOURS.saturday.display },
  { days: MERCADO_MARKET_HOURS.sunday.label, hours: MERCADO_MARKET_HOURS.sunday.display },
]

function hondurasClock(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: HONDURAS_TIMEZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)

  const weekday = parts.find((part) => part.type === 'weekday')?.value ?? 'Mon'
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0')
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0')
  const weekdayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday)

  return { weekdayIndex: weekdayIndex === -1 ? 1 : weekdayIndex, minutes: hour * 60 + minute }
}

function dayKey(weekdayIndex: number): MarketDayKey {
  if (weekdayIndex === 0) return 'sunday'
  if (weekdayIndex === 6) return 'saturday'
  return 'weekday'
}

function formatCloseHint(closeMin: number): string {
  const h = Math.floor(closeMin / 60)
  const m = closeMin % 60
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${m.toString().padStart(2, '0')} ${suffix}`
}

export type MarketOpenStatus = {
  open: boolean
  /** Texto corto para la barra de estado */
  label: string
  day: MarketDayKey
}

export function marketOpenStatus(now = new Date()): MarketOpenStatus {
  const clock = hondurasClock(now)
  const day = dayKey(clock.weekdayIndex)
  const hours = MERCADO_MARKET_HOURS[day]
  const open = clock.minutes >= hours.openMin && clock.minutes < hours.closeMin

  if (open) {
    return {
      open: true,
      label: `Mercado abierto · Cierra a las ${formatCloseHint(hours.closeMin)}`,
      day,
    }
  }

  return {
    open: false,
    label: 'Mercado cerrado ahora',
    day,
  }
}
