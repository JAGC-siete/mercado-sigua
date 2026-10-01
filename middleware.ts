import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { rewritePathForHost } from './lib/hosts'

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || ''
  const nextPath = rewritePathForHost(host, req.nextUrl.pathname)
  if (!nextPath) return NextResponse.next()
  const url = req.nextUrl.clone()
  url.pathname = nextPath
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
