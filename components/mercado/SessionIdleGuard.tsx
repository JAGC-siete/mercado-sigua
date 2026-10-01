import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import {
  AUTH_HEARTBEAT_API_PATH,
  APP_LOGIN_PATH,
} from '../../lib/mercado/paths'
import {
  LOCAL_STORAGE_SESSION_KEY,
  LOCAL_STORAGE_USER_KEY,
} from '../../lib/auth/session-manager'
import { SESSION_IDLE_MINUTES } from '../../lib/auth/role-access'
import { createBrowserSupabaseClient } from '../../lib/supabase/browser'

const HEARTBEAT_MS = 2 * 60 * 1000
const WARN_BEFORE_MS = 5 * 60 * 1000

function isGuardedPath(pathname: string): boolean {
  if (pathname === APP_LOGIN_PATH || pathname.startsWith('/app/forgot-password')) return false
  if (pathname.startsWith('/app/mercado/login')) return false
  return pathname === '/app' || pathname.startsWith('/app/')
}

export default function SessionIdleGuard() {
  const router = useRouter()
  const [warn, setWarn] = useState(false)
  const lastBeat = useRef(Date.now())

  useEffect(() => {
    if (!router.isReady || !isGuardedPath(router.pathname)) {
      setWarn(false)
      return
    }

    let cancelled = false

    async function beat() {
      const sessionId = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY)
      const res = await fetch(AUTH_HEARTBEAT_API_PATH, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      })
      if (cancelled) return
      if (res.status === 401 || res.status === 440) {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY)
        localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY)
        try {
          await createBrowserSupabaseClient().auth.signOut()
        } catch {
          // ignore
        }
        void router.replace(APP_LOGIN_PATH)
        return
      }
      lastBeat.current = Date.now()
      setWarn(false)
    }

    void beat()
    const interval = window.setInterval(() => {
      void beat()
      const idleMs = Date.now() - lastBeat.current
      const limitMs = SESSION_IDLE_MINUTES * 60 * 1000
      setWarn(idleMs >= limitMs - WARN_BEFORE_MS)
    }, HEARTBEAT_MS)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [router, router.isReady, router.pathname])

  if (!warn) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 rounded-lg border border-amber-400/40 bg-slate-900/95 px-4 py-3 text-sm text-amber-100 shadow-lg">
      Tu sesión está por cerrarse por inactividad. Mové el mouse o guardá cambios para mantenerla
      activa.
    </div>
  )
}
