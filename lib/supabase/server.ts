import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next'

type CookieStore = {
  getAll: () => { name: string; value: string }[]
  setAll: (cookies: { name: string; value: string; options: CookieOptions }[]) => void
}

function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return { url, anonKey }
}

function cookieOptionsDefaults(options: CookieOptions): CookieOptions {
  return {
    ...options,
    path: options.path ?? '/',
    sameSite: options.sameSite ?? 'lax',
    secure: options.secure ?? process.env.NODE_ENV === 'production',
    httpOnly: options.httpOnly ?? true,
    maxAge: options.maxAge ?? 60 * 60 * 24,
  }
}

function serializeCookie(name: string, value: string, options: CookieOptions): string {
  const opts = cookieOptionsDefaults(options)
  const parts = [`${name}=${encodeURIComponent(value)}`]
  if (opts.maxAge !== undefined) parts.push(`Max-Age=${Math.floor(opts.maxAge)}`)
  if (opts.domain) parts.push(`Domain=${opts.domain}`)
  if (opts.path) parts.push(`Path=${opts.path}`)
  if (opts.httpOnly) parts.push('HttpOnly')
  if (opts.secure) parts.push('Secure')
  if (opts.sameSite) {
    const same =
      typeof opts.sameSite === 'string'
        ? opts.sameSite.charAt(0).toUpperCase() + opts.sameSite.slice(1)
        : 'Lax'
    parts.push(`SameSite=${same}`)
  }
  return parts.join('; ')
}

function mergeSetCookieHeader(
  res: { getHeader: (name: string) => number | string | string[] | undefined; setHeader: (name: string, value: string[]) => void },
  cookies: { name: string; value: string; options: CookieOptions }[]
) {
  const serialized = cookies.map((c) => serializeCookie(c.name, c.value, c.options))
  const existing = res.getHeader('Set-Cookie')
  const prev = Array.isArray(existing)
    ? existing.map(String)
    : existing
      ? [String(existing)]
      : []
  res.setHeader('Set-Cookie', [...prev, ...serialized])
}

function createFromCookieStore(store: CookieStore) {
  const { url, anonKey } = supabaseEnv()
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: store.getAll,
      setAll: store.setAll,
    },
    auth: {
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })
}

export function createMercadoServerClient(req: NextApiRequest, res: NextApiResponse) {
  return createFromCookieStore({
    getAll() {
      return Object.entries(req.cookies ?? {}).map(([name, value]) => ({
        name,
        value: value ?? '',
      }))
    },
    setAll(cookies) {
      mergeSetCookieHeader(res, cookies)
    },
  })
}

export function createMercadoPagesServerClient(ctx: GetServerSidePropsContext) {
  return createFromCookieStore({
    getAll() {
      return Object.entries(ctx.req.cookies ?? {}).map(([name, value]) => ({
        name,
        value: value ?? '',
      }))
    },
    setAll(cookies) {
      mergeSetCookieHeader(ctx.res, cookies)
    },
  })
}
