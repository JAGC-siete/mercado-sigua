import type { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  APP_LOGIN_PATH,
  AUTH_LOGOUT_API_PATH,
  mercadoAdminHomePath,
  mercadoAdminListPath,
  mercadoAdminSettingsPath,
  mercadoApplicationsAdminPath,
  mercadoHomePath,
} from '../../lib/mercado/paths'
import {
  LOCAL_STORAGE_SESSION_KEY,
  LOCAL_STORAGE_USER_KEY,
} from '../../lib/auth/session-manager'
import { createBrowserSupabaseClient } from '../../lib/supabase/browser'

export default function MercadoAdminShell({
  operatorEmail,
  children,
}: {
  operatorEmail?: string
  children: ReactNode
}) {
  const router = useRouter()

  async function logout() {
    try {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY)
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY)
      await createBrowserSupabaseClient().auth.signOut()
      await fetch(AUTH_LOGOUT_API_PATH, { method: 'POST', credentials: 'include' })
    } finally {
      void router.push(APP_LOGIN_PATH)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/80">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-sm font-semibold">Mercado San Pablo · operador</p>
            {operatorEmail ? <p className="text-xs text-white/50">{operatorEmail}</p> : null}
          </div>
          <nav className="flex flex-wrap items-center gap-3 text-sm">
            <Link href={mercadoAdminHomePath()} className="text-amber-200 hover:underline">
              Inicio
            </Link>
            <Link href={mercadoAdminListPath()} className="text-amber-200 hover:underline">
              Fichas
            </Link>
            <Link href={mercadoApplicationsAdminPath()} className="text-amber-200 hover:underline">
              Solicitudes
            </Link>
            <Link href={mercadoAdminSettingsPath()} className="text-amber-200 hover:underline">
              Configuración
            </Link>
            <Link href={mercadoHomePath()} className="text-white/60 hover:underline">
              Directorio
            </Link>
            <button type="button" onClick={() => void logout()} className="text-white/50 hover:text-white">
              Salir
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl">{children}</main>
    </div>
  )
}
