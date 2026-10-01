import { emailCta, emailParagraph, emailRows, escapeHtml, wrapEmail } from '../emails'

export { escapeHtml }

export function liquidParagraph(html: string): string {
  return emailParagraph(html)
}

export function liquidCta(href: string, label: string): string {
  return emailCta(href, label)
}

export function liquidKeyValueTable(
  rows: Array<{ label: string; value: string; emphasize?: boolean }>
): string {
  return emailRows(rows.map((row) => ({ label: row.label, value: row.value })))
}

export function wrapLiquidEmail(params: {
  title: string
  subtitle?: string
  badge?: string
  bodyHtml: string
  footerNote?: string
}): string {
  const extra = [
    params.subtitle ? emailParagraph(params.subtitle) : '',
    params.bodyHtml,
    params.footerNote
      ? emailParagraph(`<span style="color:#94a3b8">${params.footerNote}</span>`)
      : '',
  ].join('')
  return wrapEmail(params.title, extra)
}
