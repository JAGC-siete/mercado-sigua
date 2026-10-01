/**
 * Residuo del corte HMAC (`mercado_op`).
 * Auth viva: JWT + `requireSuperAdmin` / `requireSuperAdminPage` en `lib/auth/*`.
 * Se conserva clear cookie para logout de transición.
 */

import { createHmac, timingSafeEqual } from 'crypto'
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next'
import {
  MERCADO_ADMIN_LOGIN_PATH,
  mercadoAdminLoginPath,
} from './paths'

export const MERCADO_ADMIN_COOKIE = 'mercado_op'
const TTL_MS = 12 * 60 * 60 * 1000

export type MercadoOperator = { email: string }

function sessionSecret(): string | null {
  const raw = (process.env.MERCADO_ADMIN_SESSION_SECRET || '').trim()
  return raw.length >= 16 ? raw : null
}

function configuredEmail(): string | null {
  const raw = (process.env.MERCADO_ADMIN_EMAIL || '').trim().toLowerCase()
  return raw.includes('@') ? raw : null
}

function configuredPassword(): string | null {
  const raw = process.env.MERCADO_ADMIN_PASSWORD || ''
  return raw.length >= 8 ? raw : null
}

export function mercadoAdminConfigured(): boolean {
  return Boolean(sessionSecret() && configuredEmail() && configuredPassword())
}

function hmac(value: string): Buffer {
  const secret = sessionSecret()
  if (!secret) throw new Error('admin_disabled')
  return createHmac('sha256', secret).update(value).digest()
}

function equalBytes(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    timingSafeEqual(a, a)
    return false
  }
  return timingSafeEqual(a, b)
}

function equalText(a: string, b: string): boolean {
  return equalBytes(hmac(`t:${a}`), hmac(`t:${b}`))
}

export function verifyMercadoAdminCredentials(email: string, password: string): boolean {
  const expectedEmail = configuredEmail()
  const expectedPassword = configuredPassword()
  if (!expectedEmail || !expectedPassword || !sessionSecret()) return false
  const emailOk = equalText(email.trim().toLowerCase(), expectedEmail)
  const passwordOk = equalText(password, expectedPassword)
  return emailOk && passwordOk
}

function encodeSession(operator: MercadoOperator, expiresAt: number): string {
  const payload = `${operator.email}|${expiresAt}`
  const sig = hmac(payload).toString('base64url')
  return `${Buffer.from(payload).toString('base64url')}.${sig}`
}

export function readMercadoAdminSession(cookieValue?: string): MercadoOperator | null {
  if (!cookieValue || !sessionSecret()) return null
  const [encoded, sig] = cookieValue.split('.')
  if (!encoded || !sig) return null
  let payload: string
  try {
    payload = Buffer.from(encoded, 'base64url').toString('utf8')
  } catch {
    return null
  }
  const expected = hmac(payload).toString('base64url')
  if (!equalBytes(Buffer.from(sig), Buffer.from(expected))) return null
  const [email, expRaw] = payload.split('|')
  const expiresAt = Number(expRaw)
  if (!email || !Number.isFinite(expiresAt) || expiresAt < Date.now()) return null
  return { email }
}

function cookieFromReq(req: { cookies?: Partial<Record<string, string>> }): string | undefined {
  return req.cookies?.[MERCADO_ADMIN_COOKIE]
}

export function mercadoOperatorFromReq(req: {
  cookies?: Partial<Record<string, string>>
}): MercadoOperator | null {
  return readMercadoAdminSession(cookieFromReq(req))
}

function cookieFlags(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(TTL_MS / 1000)}${secure}`
}

export function mercadoAdminSetCookie(res: NextApiResponse, operator: MercadoOperator) {
  const value = encodeSession(operator, Date.now() + TTL_MS)
  res.setHeader('Set-Cookie', `${MERCADO_ADMIN_COOKIE}=${value}; ${cookieFlags()}`)
}

export function mercadoAdminClearCookie(res: NextApiResponse) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  const cleared = `${MERCADO_ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
  const existing = res.getHeader('Set-Cookie')
  const prev = Array.isArray(existing)
    ? existing.map(String)
    : existing
      ? [String(existing)]
      : []
  res.setHeader('Set-Cookie', [...prev, cleared])
}

export function requireMercadoAdminApi(
  req: NextApiRequest,
  res: NextApiResponse
): MercadoOperator | null {
  const operator = mercadoOperatorFromReq(req)
  if (!operator) {
    res.status(401).json({ error: 'Inicia sesión para operar el directorio' })
    return null
  }
  return operator
}

export async function requireMercadoAdminPage(ctx: GetServerSidePropsContext): Promise<
  | { ok: true; operator: MercadoOperator }
  | { ok: false; redirect: { destination: string; permanent: false } }
> {
  const operator = mercadoOperatorFromReq(ctx.req)
  if (!operator) {
    const next = ctx.resolvedUrl && ctx.resolvedUrl !== MERCADO_ADMIN_LOGIN_PATH
      ? ctx.resolvedUrl
      : undefined
    return { ok: false, redirect: { destination: mercadoAdminLoginPath(next), permanent: false } }
  }
  return { ok: true, operator }
}
