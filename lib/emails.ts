export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function wrapEmail(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#1e293b;border-radius:16px;padding:28px">
    <h1 style="margin:0 0 16px;font-size:20px;color:#fff">${escapeHtml(title)}</h1>
    ${bodyHtml}
  </div></body></html>`
}

export function emailParagraph(html: string): string {
  return `<p style="margin:0 0 12px;line-height:1.5">${html}</p>`
}

export function emailCta(href: string, label: string): string {
  return `<p style="margin:20px 0"><a href="${escapeHtml(href)}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none">${escapeHtml(label)}</a></p>`
}

export function emailRows(rows: Array<{ label: string; value: string }>): string {
  const body = rows
    .map(
      (row) =>
        `<tr><td style="padding:6px 0;color:#94a3b8">${escapeHtml(row.label)}</td><td style="padding:6px 0;color:#fff">${escapeHtml(row.value)}</td></tr>`
    )
    .join('')
  return `<table style="width:100%;border-collapse:collapse">${body}</table>`
}
