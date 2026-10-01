import { useCallback, useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import type { GetServerSideProps } from 'next'
import MercadoAdminShell from '../../../../components/mercado/MercadoAdminShell'
import { Badge } from '../../../../components/ui/badge'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { requireMercadoAdminPage } from '../../../../lib/mercado/admin-auth'
import {
  VENDOR_CATEGORIES,
  VENDOR_CATEGORY_LABEL,
  type VendorCategory,
} from '../../../../lib/mercado/categories'
import {
  MERCADO_VENDORS_API_PATH,
  mercadoAdminNewPath,
  mercadoAdminEditPath,
  mercadoApplicationsAdminPath,
  mercadoVendorPath,
} from '../../../../lib/mercado/paths'
import type { VendorStatus } from '../../../../lib/mercado/schema'
import type { VendorRow } from '../../../../lib/mercado/vendors-db'

function StatusBadge({ status }: { status: VendorStatus }) {
  const className =
    status === 'active'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      : 'bg-white/10 text-gray-300 border-white/20'
  return <Badge className={className}>{status === 'active' ? 'Activo' : 'Inactivo'}</Badge>
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const auth = await requireMercadoAdminPage(ctx)
  if (!auth.ok) return { redirect: auth.redirect }
  return { props: { operatorEmail: auth.operator.email } }
}

export default function MercadoFichasAdminPage({ operatorEmail }: { operatorEmail: string }) {
  const [rows, setRows] = useState<VendorRow[]>([])
  const [category, setCategory] = useState<VendorCategory | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(MERCADO_VENDORS_API_PATH, { credentials: 'include' })
      const body = (await res.json().catch(() => ({}))) as {
        vendors?: VendorRow[]
        error?: string
      }
      if (!res.ok) throw new Error(body.error || 'No se pudieron cargar las fichas')
      setRows(body.vendors ?? [])
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las fichas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const visible = useMemo(
    () => (category === 'all' ? rows : rows.filter((row) => row.category === category)),
    [rows, category]
  )

  async function patchFlags(id: string, patch: { status?: VendorStatus; featured?: boolean }) {
    setSavingId(id)
    try {
      const res = await fetch(MERCADO_VENDORS_API_PATH, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      })
      const body = (await res.json().catch(() => ({}))) as { vendor?: VendorRow; error?: string }
      if (!res.ok) throw new Error(body.error || 'No se pudo actualizar')
      if (body.vendor) {
        setRows((prev) => prev.map((row) => (row.id === id ? body.vendor! : row)))
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <MercadoAdminShell operatorEmail={operatorEmail}>
      <Head>
        <title>Fichas mercado | San Pablo</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="space-y-6 p-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Fichas /mercadosanpablosigua</h1>
            <p className="mt-1 max-w-2xl text-sm text-white/60">
              Alta y baja de puestos. Destacado = aportación anual al día. El público solo ve
              activos; el pickup es por WhatsApp.
            </p>
            <Link
              href={mercadoApplicationsAdminPath()}
              className="mt-2 inline-block text-sm text-amber-200 underline-offset-2 hover:underline"
            >
              Ver solicitudes de inscripción
            </Link>
          </div>
          <Link href={mercadoAdminNewPath()}>
            <Button>Nueva ficha</Button>
          </Link>
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

        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg text-white">Listado</CardTitle>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as VendorCategory | 'all')}
              className="h-10 w-48 rounded-lg border border-white/20 bg-white/10 px-3 text-white"
            >
              <option value="all">Todas</option>
              {VENDOR_CATEGORIES.map((key) => (
                <option key={key} value={key}>
                  {VENDOR_CATEGORY_LABEL[key]}
                </option>
              ))}
            </select>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="py-8 text-sm text-white/70">Cargando…</p>
            ) : visible.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-300">
                No hay fichas. Creá una o aprobá una solicitud.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-gray-400">
                    <tr>
                      <th className="px-3 py-2">Negocio</th>
                      <th className="px-3 py-2">Categoría</th>
                      <th className="px-3 py-2">Visible</th>
                      <th className="px-3 py-2">Destacado</th>
                      <th className="px-3 py-2">WhatsApp</th>
                      <th className="px-3 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-gray-200">
                    {visible.map((row) => (
                      <tr key={row.id}>
                        <td className="px-3 py-3">
                          <p className="font-medium text-white">{row.name}</p>
                          <p className="text-xs text-white/40">{row.stall_location ?? '—'}</p>
                        </td>
                        <td className="px-3 py-3">
                          {VENDOR_CATEGORY_LABEL[row.category as VendorCategory] ?? row.category}
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={row.status} />
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            disabled={savingId === row.id}
                            onClick={() =>
                              void patchFlags(row.id, {
                                status: row.status === 'active' ? 'inactive' : 'active',
                              })
                            }
                          >
                            {row.status === 'active' ? 'Dar de baja' : 'Publicar'}
                          </Button>
                        </td>
                        <td className="px-3 py-3">
                          <Badge
                            className={
                              row.featured
                                ? 'border-amber-400/30 bg-amber-500/15 text-amber-200'
                                : 'border-white/20 bg-white/5 text-gray-400'
                            }
                          >
                            {row.featured ? 'Aportación al día' : 'Sin aportación'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            disabled={savingId === row.id}
                            onClick={() => void patchFlags(row.id, { featured: !row.featured })}
                          >
                            {row.featured ? 'Quitar destacado' : 'Marcar aportación'}
                          </Button>
                        </td>
                        <td className="px-3 py-3">{row.whatsapp}</td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1">
                            <Link
                              href={mercadoAdminEditPath(row.id)}
                              className="text-amber-200 underline-offset-2 hover:underline"
                            >
                              Editar
                            </Link>
                            <Link
                              href={mercadoVendorPath(row.slug)}
                              className="text-white/50 underline-offset-2 hover:underline"
                              target="_blank"
                            >
                              Ver pública
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MercadoAdminShell>
  )
}
