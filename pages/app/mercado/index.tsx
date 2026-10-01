import { useCallback, useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import type { GetServerSideProps } from 'next'
import MercadoAdminShell from '../../../components/mercado/MercadoAdminShell'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { requireSuperAdminPage } from '../../../lib/auth/page-auth'
import {
  MERCADO_ADMIN_STATS_API_PATH,
  mercadoAdminListPath,
  mercadoAdminNewPath,
  mercadoAdminSettingsPath,
  mercadoApplicationsAdminPath,
} from '../../../lib/mercado/paths'

type StatsPayload = {
  pendingApplications: number
  activeVendors: number
  featuredVendors: number
  vipExpiringSoon: number
  vipExpired: number
  waClicks7d: number
  topVendorsByWa: Array<{ id: string; name: string; clicks: number }>
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const auth = await requireSuperAdminPage(ctx)
  if (!auth.ok) return { redirect: auth.redirect }
  return { props: { operatorEmail: auth.email ?? '' } }
}

export default function MercadoAdminHomePage({ operatorEmail }: { operatorEmail: string }) {
  const [stats, setStats] = useState<StatsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(MERCADO_ADMIN_STATS_API_PATH, { credentials: 'include' })
      const body = (await res.json().catch(() => ({}))) as StatsPayload & { error?: string }
      if (!res.ok) throw new Error(body.error || 'No se pudieron cargar las métricas')
      setStats(body)
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error')
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const cards = stats
    ? [
        {
          label: 'Solicitudes pendientes',
          value: stats.pendingApplications,
          href: mercadoApplicationsAdminPath(),
        },
        {
          label: 'Fichas activas',
          value: stats.activeVendors,
          href: mercadoAdminListPath(),
        },
        {
          label: 'VIP destacados',
          value: stats.featuredVendors,
          href: `${mercadoAdminListPath()}`,
        },
        {
          label: 'VIP por vencer (30d)',
          value: stats.vipExpiringSoon,
          href: mercadoAdminListPath(),
        },
        {
          label: 'Clicks WA (7d)',
          value: stats.waClicks7d,
          href: mercadoAdminListPath(),
        },
      ]
    : []

  return (
    <MercadoAdminShell operatorEmail={operatorEmail}>
      <Head>
        <title>Operador mercado | San Pablo</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="space-y-6 p-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Inicio · operador</h1>
            <p className="mt-1 max-w-2xl text-sm text-white/60">
              Resumen del directorio Pickup: cola de solicitudes, VIP y pedidos por WhatsApp.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={mercadoAdminNewPath()}>
              <Button>Nueva ficha</Button>
            </Link>
            <Link href={mercadoAdminSettingsPath()}>
              <Button variant="outline">Configuración</Button>
            </Link>
          </div>
        </header>

        {error ? (
          <Card variant="glass">
            <CardContent className="p-5">
              <p className="text-sm text-red-400">{error}</p>
              <Button variant="outline" className="mt-3" onClick={() => void load()}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {loading ? <p className="text-sm text-white/70">Cargando métricas…</p> : null}

        {!loading && stats ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <Link key={card.label} href={card.href}>
                  <Card variant="glass" className="transition hover:border-amber-400/40">
                    <CardContent className="p-5">
                      <p className="text-xs uppercase tracking-wide text-white/40">{card.label}</p>
                      <p className="mt-2 text-3xl font-bold text-white">{card.value}</p>
                      {card.label.includes('por vencer') && stats.vipExpired > 0 ? (
                        <p className="mt-1 text-xs text-red-300">
                          {stats.vipExpired} VIP vencido{stats.vipExpired === 1 ? '' : 's'}
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-lg text-white">Top Pedir y Recoger (7 días)</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.topVendorsByWa.length === 0 ? (
                  <p className="text-sm text-white/50">
                    Aún no hay clicks registrados. Aparecen cuando el público usa el botón verde.
                  </p>
                ) : (
                  <ul className="divide-y divide-white/10">
                    {stats.topVendorsByWa.map((row) => (
                      <li
                        key={row.id}
                        className="flex items-center justify-between py-3 text-sm text-gray-200"
                      >
                        <span>{row.name}</span>
                        <span className="font-semibold text-amber-200">{row.clicks}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3 text-sm">
              <Link
                href={mercadoApplicationsAdminPath()}
                className="text-amber-200 underline-offset-2 hover:underline"
              >
                Ir a solicitudes
              </Link>
              <Link
                href={mercadoAdminListPath()}
                className="text-amber-200 underline-offset-2 hover:underline"
              >
                Ir a fichas
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </MercadoAdminShell>
  )
}
