import { useEffect, useState, type FormEvent } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { APP_LOGIN_PATH } from '../../lib/mercado/paths'
import { normalizeLoginPassword } from '../../lib/auth/role-access'
import { createBrowserSupabaseClient } from '../../lib/supabase/browser'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const next =
    typeof router.query.next === 'string' && router.query.next.startsWith('/')
      ? router.query.next
      : APP_LOGIN_PATH
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()
    void supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session))
    })
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const nextPassword = normalizeLoginPassword(password)
      if (nextPassword.length < 8) {
        throw new Error('La contraseña necesita al menos 8 caracteres.')
      }
      if (nextPassword !== normalizeLoginPassword(confirm)) {
        throw new Error('Las contraseñas no coinciden.')
      }
      const supabase = createBrowserSupabaseClient()
      const { error: updateErr } = await supabase.auth.updateUser({
        password: nextPassword,
      })
      if (updateErr) throw new Error(updateErr.message)
      void router.replace(next)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <Head>
        <title>Nueva contraseña · Mercado San Pablo</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Card variant="glass" className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg text-white">Nueva contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          {!ready ? (
            <p className="text-sm text-gray-300">
              Abrí el enlace del correo para definir tu contraseña. Si ya expiró, pedí uno nuevo
              desde recuperar contraseña.
            </p>
          ) : (
            <form onSubmit={(event) => void onSubmit(event)} className="space-y-4">
              <label className="block text-sm text-gray-200">
                Contraseña
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 bg-white/10 text-white"
                  autoComplete="new-password"
                  required
                />
              </label>
              <label className="block text-sm text-gray-200">
                Confirmar
                <Input
                  type="password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  className="mt-1 bg-white/10 text-white"
                  autoComplete="new-password"
                  required
                />
              </label>
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              <Button type="submit" disabled={busy}>
                {busy ? 'Guardando…' : 'Guardar'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
