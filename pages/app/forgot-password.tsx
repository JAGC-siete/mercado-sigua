import { useState, type FormEvent } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import {
  APP_LOGIN_PATH,
  AUTH_FORGOT_PASSWORD_API_PATH,
} from '../../lib/mercado/paths'
import { normalizeLoginEmail } from '../../lib/auth/role-access'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch(AUTH_FORGOT_PASSWORD_API_PATH, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizeLoginEmail(email) }),
      })
      const body = (await res.json().catch(() => ({}))) as {
        error?: string
        message?: string
      }
      if (!res.ok) throw new Error(body.error || 'No se pudo enviar')
      setMessage(
        body.message ||
          'Si el correo existe, enviamos instrucciones para restablecer la contraseña.'
      )
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <Head>
        <title>Recuperar contraseña · Mercado San Pablo</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Card variant="glass" className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg text-white">Recuperar contraseña</CardTitle>
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
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
            <Button type="submit" disabled={busy}>
              {busy ? 'Enviando…' : 'Enviar enlace'}
            </Button>
            <p className="text-sm text-gray-400">
              <Link href={APP_LOGIN_PATH} className="underline hover:text-white">
                Volver a iniciar sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
