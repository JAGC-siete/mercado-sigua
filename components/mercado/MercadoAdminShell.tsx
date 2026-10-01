import type { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  MERCADO_ADMIN_LOGOUT_API_PATH,
  mercadoAdminListPath,
  mercadoApplicationsAdminPath,
  mercadoHomePath,
} from '../../lib/mercado/paths'

export default function MercadoAdminShell({
  operatorEmail,
  children,
}: {
  operatorEmail?: string
  children: ReactNode
}) {
  const router = useRouter()

  async function logout() {
    await fetch(MERCADO_ADMIN_LOGOUT_API_PATH, { method: 'POST', credentials: 'include' })
    void router.push('/app/mercado/login')
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
            <Link href={mercadoAdminListPath()} className="text-amber-200 hover:underline">
              Fichas
            </Link>
            <Link href={mercadoApplicationsAdminPath()} className="text-amber-200 hover:underline">
              Solicitudes
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
