import { HONDURAS_TIMEZONE } from '../timezone'
import type { VendorCategory } from './categories'

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

export function parseHoursWindow(hoursNote: string | null) {
  if (!hoursNote) return null
  const match = hoursNote.match(/(\d{1,2}):(\d{2})[–-](\d{1,2}):(\d{2})/)
  if (!match) return null
  const startMin = Number(match[1]) * 60 + Number(match[2])
  const endMin = Number(match[3]) * 60 + Number(match[4])
  const closedSunday = /Lun/.test(hoursNote) && /Sáb/.test(hoursNote)
  return { startMin, endMin, closedSunday }
}

export function stallStatusLabel(
  vendor: { category: VendorCategory; hoursNote: string | null },
  now = new Date()
) {
  const clock = hondurasClock(now)
  const window = parseHoursWindow(vendor.hoursNote)
  if (!window) return 'Preguntá en el puesto'
  if (window.closedSunday && clock.weekdayIndex === 0) return 'Cerrado · volvé mañana temprano'
  const open = clock.minutes >= window.startMin && clock.minutes < window.endMin
  if (!open) return 'Cerrado · volvé temprano'
  if (vendor.category === 'comida' && clock.minutes >= 10 * 60 && clock.minutes < 15 * 60) {
    return 'Recibiendo pedidos para el almuerzo'
  }
  return 'Abierto ahora'
}
