import Head from 'next/head'
import Link from 'next/link'
import type { GetServerSideProps } from 'next'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { requireVendorPage } from '../../lib/auth/page-auth'
import {
  APP_LOGIN_PATH,
  AUTH_LOGOUT_API_PATH,
  MERCADO_ADMIN_PATH,
  mercadoHomePath,
} from '../../lib/mercado/paths'
import {
  LOCAL_STORAGE_SESSION_KEY,
  LOCAL_STORAGE_USER_KEY,
} from '../../lib/auth/session-manager'
import { createBrowserSupabaseClient } from '../../lib/supabase/browser'

type Props = {
  email: string | null
  role: string
}

export default function AppHomePage({ email, role }: Props) {
  async function logout() {
    try {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY)
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY)
      const supabase = createBrowserSupabaseClient()
      await supabase.auth.signOut()
      await fetch(AUTH_LOGOUT_API_PATH, { method: 'POST', credentials: 'include' })
    } finally {
      window.location.href = APP_LOGIN_PATH
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <Head>
        <title>Mi puesto · Mercado San Pablo</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Card variant="glass" className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-lg text-white">Portal del locatario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-200">
          <p>
            Sesión: <span className="text-white">{email || 'sin correo'}</span> ({role})
          </p>
          <p>
            El editor del puesto todavía no está disponible aquí. Mientras tanto podés ver el
            directorio público.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={mercadoHomePath()}>Ver directorio</Link>
            </Button>
            {role === 'super_admin' ? (
              <Button asChild variant="outline">
                <Link href={MERCADO_ADMIN_PATH}>Ir a fichas</Link>
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={() => void logout()}>
              Salir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const auth = await requireVendorPage(ctx)
  if (!auth.ok) return { redirect: auth.redirect }
  return {
    props: {
      email: auth.email,
      role: auth.role,
    },
  }
}
