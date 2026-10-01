import { useEffect, useState } from 'react'
import { MERCADO_HOURS_ROWS } from '../../lib/mercado/market-hours'
import { MERCADO_SITE_PUBLIC_API_PATH } from '../../lib/mercado/paths'
import type { MercadoSitePublic } from '../../lib/mercado/site-settings'
import { MERCADO_DIRECTORY_WHATSAPP } from '../../lib/mercado/whatsapp'
import type { MarketDayHours, MarketDayKey } from '../../lib/mercado/market-hours'
import { MERCADO_MARKET_HOURS } from '../../lib/mercado/market-hours'

const DEFAULT_PUBLIC: MercadoSitePublic = {
  forceClosed: false,
  supportWhatsapp: MERCADO_DIRECTORY_WHATSAPP,
  hoursRows: MERCADO_HOURS_ROWS,
  hours: MERCADO_MARKET_HOURS as Record<MarketDayKey, MarketDayHours>,
}

export function useMercadoSitePublic() {
  const [site, setSite] = useState<MercadoSitePublic>(DEFAULT_PUBLIC)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(MERCADO_SITE_PUBLIC_API_PATH)
        if (!res.ok) return
        const body = (await res.json()) as Partial<MercadoSitePublic>
        if (cancelled) return
        setSite({
          forceClosed: Boolean(body.forceClosed),
          supportWhatsapp: body.supportWhatsapp || MERCADO_DIRECTORY_WHATSAPP,
          hoursRows: Array.isArray(body.hoursRows) && body.hoursRows.length > 0
            ? body.hoursRows
            : MERCADO_HOURS_ROWS,
          hours: body.hours ?? MERCADO_MARKET_HOURS,
        })
      } catch {
        // keep defaults
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return site
}
