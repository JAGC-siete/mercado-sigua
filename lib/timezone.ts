export const HONDURAS_TIMEZONE = 'America/Tegucigalpa'

export function getHondurasTimestamp(): string {
  return new Date().toLocaleString('sv-SE', { timeZone: HONDURAS_TIMEZONE })
}

export function formatDateTimeForHonduras(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('es-HN', {
    timeZone: HONDURAS_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
