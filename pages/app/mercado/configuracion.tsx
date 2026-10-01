import { useCallback, useEffect, useState } from 'react'
import Head from 'next/head'
import type { GetServerSideProps } from 'next'
import MercadoAdminShell from '../../../components/mercado/MercadoAdminShell'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { requireSuperAdminPage } from '../../../lib/auth/page-auth'
import { MERCADO_ADMIN_SETTINGS_API_PATH } from '../../../lib/mercado/paths'
import type { HoursOverride, MercadoSiteSettings } from '../../../lib/mercado/site-settings'
import { mergeMarketHours } from '../../../lib/mercado/site-settings'
import type { MarketDayKey } from '../../../lib/mercado/market-hours'

const fieldClass = 'bg-white/10 text-white placeholder:text-gray-400'

type DayForm = { openMin: number; closeMin: number; display: string }

function minutesToTimeInput(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function timeInputToMinutes(value: string): number | null {
  const match = value.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  const h = Number(match[1])
  const m = Number(match[2])
  if (h > 23 || m > 59) return null
  return h * 60 + m
}

function formatDisplay(openMin: number, closeMin: number): string {
  const fmt = (min: number) => {
    const h = Math.floor(min / 60)
    const m = min % 60
    const suffix = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 === 0 ? 12 : h % 12
    return `${h12}:${String(m).padStart(2, '0')} ${suffix}`
  }
  return `${fmt(openMin)} – ${fmt(closeMin)}`
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const auth = await requireSuperAdminPage(ctx)
  if (!auth.ok) return { redirect: auth.redirect }
  return { props: { operatorEmail: auth.email ?? '' } }
}

export default function MercadoConfiguracionPage({ operatorEmail }: { operatorEmail: string }) {
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)
  const [forceClosed, setForceClosed] = useState(false)
  const [supportWhatsapp, setSupportWhatsapp] = useState('')
  const [days, setDays] = useState<Record<MarketDayKey, DayForm>>({
    weekday: { openMin: 5 * 60, closeMin: 16 * 60, display: '5:00 AM – 4:00 PM' },
    saturday: { openMin: 5 * 60, closeMin: 16 * 60, display: '5:00 AM – 4:00 PM' },
    sunday: { openMin: 6 * 60, closeMin: 12 * 60, display: '6:00 AM – 12:00 PM' },
  })

  const applySettings = useCallback((settings: MercadoSiteSettings) => {
    setForceClosed(settings.forceClosed)
    setSupportWhatsapp(settings.supportWhatsapp)
    const merged = mergeMarketHours(settings.hoursOverride)
    setDays({
      weekday: {
        openMin: merged.weekday.openMin,
        closeMin: merged.weekday.closeMin,
        display: merged.weekday.display,
      },
      saturday: {
        openMin: merged.saturday.openMin,
        closeMin: merged.saturday.closeMin,
        display: merged.saturday.display,
      },
      sunday: {
        openMin: merged.sunday.openMin,
        closeMin: merged.sunday.closeMin,
        display: merged.sunday.display,
      },
    })
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(MERCADO_ADMIN_SETTINGS_API_PATH, { credentials: 'include' })
      const body = (await res.json().catch(() => ({}))) as {
        settings?: MercadoSiteSettings
        error?: string
      }
      if (!res.ok || !body.settings) throw new Error(body.error || 'No se pudo cargar')
      applySettings(body.settings)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar')
    } finally {
      setLoading(false)
    }
  }, [applySettings])

  useEffect(() => {
    void load()
  }, [load])

  function updateDay(key: MarketDayKey, field: 'open' | 'close', value: string) {
    const mins = timeInputToMinutes(value)
    if (mins === null) return
    setDays((current) => {
      const next = { ...current[key] }
      if (field === 'open') next.openMin = mins
      else next.closeMin = mins
      next.display = formatDisplay(next.openMin, next.closeMin)
      return { ...current, [key]: next }
    })
  }

  async function onSave() {
    setBusy(true)
    setError(null)
    setOkMsg(null)
    try {
      const hoursOverride: HoursOverride = {
        weekday: days.weekday,
        saturday: days.saturday,
        sunday: days.sunday,
      }
      const res = await fetch(MERCADO_ADMIN_SETTINGS_API_PATH, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forceClosed,
          supportWhatsapp,
          hoursOverride,
        }),
      })
      const body = (await res.json().catch(() => ({}))) as {
        settings?: MercadoSiteSettings
        error?: string
      }
      if (!res.ok) throw new Error(body.error || 'No se pudo guardar')
      if (body.settings) applySettings(body.settings)
      setOkMsg('Configuración guardada.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setBusy(false)
    }
  }

  const dayLabels: Record<MarketDayKey, string> = {
    weekday: 'Lunes a viernes',
    saturday: 'Sábados',
    sunday: 'Domingos',
  }

  return (
    <MercadoAdminShell operatorEmail={operatorEmail}>
      <Head>
        <title>Configuración mercado | San Pablo</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="mx-auto w-full max-w-2xl space-y-6 p-6">
        <header>
          <h1 className="text-2xl font-bold text-white">Configuración del directorio</h1>
          <p className="mt-1 text-sm text-white/60">
            Cierre forzado, WhatsApp de soporte y horario oficial del mercado.
          </p>
        </header>

        {loading ? <p className="text-sm text-white/70">Cargando…</p> : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {okMsg ? <p className="text-sm text-emerald-400">{okMsg}</p> : null}

        {!loading ? (
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg text-white">Estado y contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <label className="flex items-center gap-3 text-sm text-gray-200">
                <input
                  type="checkbox"
                  checked={forceClosed}
                  onChange={(event) => setForceClosed(event.target.checked)}
                />
                Forzar “Mercado cerrado ahora” (festivos / emergencia)
              </label>

              <div>
                <label htmlFor="support-wa" className="mb-1 block text-sm font-medium text-gray-200">
                  WhatsApp de soporte / administración
                </label>
                <Input
                  id="support-wa"
                  value={supportWhatsapp}
                  onChange={(event) => setSupportWhatsapp(event.target.value)}
                  placeholder="50432226773"
                  className={fieldClass}
                />
              </div>

              <fieldset className="space-y-4">
                <legend className="text-sm font-medium text-gray-200">Horario oficial</legend>
                {(Object.keys(dayLabels) as MarketDayKey[]).map((key) => (
                  <div key={key} className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                    <p className="text-sm text-white/70">{dayLabels[key]}</p>
                    <div>
                      <label className="mb-1 block text-xs text-white/40">Abre</label>
                      <Input
                        type="time"
                        value={minutesToTimeInput(days[key].openMin)}
                        onChange={(event) => updateDay(key, 'open', event.target.value)}
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-white/40">Cierra</label>
                      <Input
                        type="time"
                        value={minutesToTimeInput(days[key].closeMin)}
                        onChange={(event) => updateDay(key, 'close', event.target.value)}
                        className={fieldClass}
                      />
                    </div>
                    <p className="text-xs text-white/40 sm:col-span-3">{days[key].display}</p>
                  </div>
                ))}
              </fieldset>

              <Button type="button" disabled={busy} onClick={() => void onSave()}>
                {busy ? 'Guardando…' : 'Guardar configuración'}
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </MercadoAdminShell>
  )
}
