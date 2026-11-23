import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { redirectTargetFor } from './lib/hosts'

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || ''
  const target = redirectTargetFor(host, req.nextUrl.pathname)
  if (!target) return NextResponse.next()

  // Behind Railway's proxy nextUrl may carry the internal origin; build it from the Host header.
  const proto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || req.nextUrl.protocol.replace(':', '')
  const origin = target.origin ?? `${proto}://${host}`
  return NextResponse.redirect(new URL(`${target.pathname}${req.nextUrl.search}`, origin), 301)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
