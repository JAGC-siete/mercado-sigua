import { useCallback, useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { GetServerSideProps } from 'next'
import MercadoAdminShell from '../../../../components/mercado/MercadoAdminShell'
import VendorForm, { type VendorFormValues } from '../../../../components/mercado/VendorForm'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { requireMercadoAdminPage } from '../../../../lib/mercado/admin-auth'
import { isVendorCategory } from '../../../../lib/mercado/categories'
import {
  MERCADO_VENDORS_API_PATH,
  mercadoAdminListPath,
} from '../../../../lib/mercado/paths'
import { DEFAULT_VENDOR_PAYMENT_METHODS, type CreateVendorPayload, type VendorPaymentMethod, type VendorStatus } from '../../../../lib/mercado/schema'
import type { VendorRow } from '../../../../lib/mercado/vendors-db'

function rowToFormValues(row: VendorRow): VendorFormValues {
  const gallery = Array.isArray(row.gallery) ? row.gallery : []
  const facade =
    gallery[0] && typeof gallery[0] === 'object' && gallery[0] !== null && 'src' in gallery[0]
      ? String((gallery[0] as { src: string }).src)
      : ''
  const products = [...(row.products ?? []), '', '', '', '', ''].slice(0, 5)
  const methods = (row.payment_methods ?? []).filter(Boolean) as VendorPaymentMethod[]
  return {
    name: row.name,
    slug: row.slug,
    category: isVendorCategory(row.category) ? row.category : '',
    description: row.description,
    whatsapp: row.whatsapp,
    logoUrl: row.logo_url || '',
    facadeUrl: facade,
    stallLocation: row.stall_location || '',
    hoursNote: row.hours_note || '',
    products,
    paymentMethods: methods.length > 0 ? methods : [...DEFAULT_VENDOR_PAYMENT_METHODS],
    status: row.status as VendorStatus,
    featured: Boolean(row.featured),
  }
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const auth = await requireMercadoAdminPage(ctx)
  if (!auth.ok) return { redirect: auth.redirect }
  return { props: { operatorEmail: auth.operator.email } }
}

export default function MercadoFichaEditPage({ operatorEmail }: { operatorEmail: string }) {
  const router = useRouter()
  const id = typeof router.query.id === 'string' ? router.query.id : ''
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initial, setInitial] = useState<VendorFormValues | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(MERCADO_VENDORS_API_PATH, { credentials: 'include' })
      const body = (await res.json().catch(() => ({}))) as {
        vendors?: VendorRow[]
        error?: string
      }
      if (!res.ok) throw new Error(body.error || 'No se pudo cargar')
      const vendor = body.vendors?.find((row) => row.id === id)
      if (!vendor) throw new Error('Ficha no encontrada')
      setInitial(rowToFormValues(vendor))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error')
      setInitial(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  async function onValid(payload: CreateVendorPayload) {
    if (!id) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(MERCADO_VENDORS_API_PATH, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...payload }),
      })
      const json = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(json.error || 'No se pudo guardar')
      void router.push(mercadoAdminListPath())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setBusy(false)
    }
  }

  return (
    <MercadoAdminShell operatorEmail={operatorEmail}>
      <Head>
        <title>Editar ficha mercado | San Pablo</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="mx-auto w-full max-w-2xl space-y-6 p-6">
        <Link href={mercadoAdminListPath()} className="text-sm text-amber-200 underline">
          Volver al listado
        </Link>
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg text-white">Editar ficha</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <p className="text-sm text-gray-300">Cargando…</p> : null}
            {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}
            {!loading && initial ? (
              <VendorForm
                key={id}
                initialValues={initial}
                submitLabel="Guardar cambios"
                busy={busy}
                onValid={onValid}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </MercadoAdminShell>
  )
}
