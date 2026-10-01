export function getResendFrom(): string {
  return process.env.RESEND_FROM || 'Mercado San Pablo <noreply@localhost>'
}

export function getNotifyEmail(): string | null {
  const raw = (process.env.NOTIFY_EMAIL || '').trim()
  return raw.includes('@') ? raw : null
}
