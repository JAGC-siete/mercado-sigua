import { useState, type FormEvent } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import {
  APP_FORGOT_PASSWORD_PATH,
  AUTH_LOGIN_API_PATH,
} from '../../lib/mercado/paths'
import {
  LOCAL_STORAGE_SESSION_KEY,
  LOCAL_STORAGE_USER_KEY,
} from '../../lib/auth/session-manager'
import { normalizeLoginEmail, normalizeLoginPassword } from '../../lib/auth/role-access'
import { createBrowserSupabaseClient } from '../../lib/supabase/browser'

type LoginResponse = {
  error?: string
  redirectTo?: string
  user?: {
    id: string
    email: string
    role: string
    vendor_id: string | null
  }
  session?: {
    access_token: string
    refresh_token: string
    session_id?: string | null
  }
  userProfile?: Record<string, unknown>
}

export default function AppLoginPage() {
  const router = useRouter()
  const redirect =
    typeof router.query.redirect === 'string' ? router.query.redirect : null
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(AUTH_LOGIN_API_PATH, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizeLoginEmail(email),
          password: normalizeLoginPassword(password),
          redirect,
        }),
      })
      const body = (await res.json().catch(() => ({}))) as LoginResponse
      if (!res.ok || !body.user || !body.session) {
        throw new Error(body.error || 'Credenciales inválidas')
      }

      const supabase = createBrowserSupabaseClient()
      const { error: setErr } = await supabase.auth.setSession({
        access_token: body.session.access_token,
        refresh_token: body.session.refresh_token,
      })
      if (setErr) throw new Error(setErr.message)

      localStorage.setItem(
        LOCAL_STORAGE_USER_KEY,
        JSON.stringify({
          ...body.user,
          userProfile: body.userProfile,
        })
      )
      if (body.session.session_id) {
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, body.session.session_id)
      }

      void router.replace(body.redirectTo || '/app')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo entrar')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <Head>
        <title>Iniciar sesión · Mercado San Pablo</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Card variant="glass" className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg text-white">Iniciar sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(event) => void onSubmit(event)} className="space-y-4">
            <label className="block text-sm text-gray-200">
              Correo
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 bg-white/10 text-white"
                autoComplete="username"
                required
              />
            </label>
            <label className="block text-sm text-gray-200">
              Contraseña
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 bg-white/10 text-white"
                autoComplete="current-password"
                required
              />
            </label>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <Button type="submit" disabled={busy}>
              {busy ? 'Entrando…' : 'Entrar'}
            </Button>
            <p className="text-sm text-gray-400">
              <Link href={APP_FORGOT_PASSWORD_PATH} className="underline hover:text-white">
                ¿Olvidaste tu contraseña?
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
