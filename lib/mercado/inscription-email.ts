/**
 * Aviso interno cuando un locatario envía una solicitud de registro de local.
 */

import {
  escapeHtml,
  liquidKeyValueTable,
  liquidParagraph,
  wrapLiquidEmail,
} from '../emails/liquid-layout'
import { formatDateTimeForHonduras } from '../timezone'
import { mercadoInscriptionCanonical } from './meta'
import { mercadoApplicationsAdminPath } from './paths'
import { mercadoAbsoluteUrl } from './public-url'
import {
  mercadoPresencePlanNotifyLabel,
  type MercadoInscription,
} from './inscription-schema'

/** Destino de operación del MVP. No es secreto; se puede sobreescribir por env. */
export const MERCADO_INSCRIPTION_NOTIFY_DEFAULT = 'jorge7gomez@gmail.com'

export function mercadoInscriptionNotifyEmail(): string {
  const dedicated = process.env.MERCADO_INSCRIPTION_NOTIFY_EMAIL?.trim()
  if (dedicated) return dedicated
  const shared = process.env.NOTIFY_EMAIL?.trim()
  if (shared && shared.includes('@')) return shared
  return MERCADO_INSCRIPTION_NOTIFY_DEFAULT
}

export function buildMercadoInscriptionNotification(params: {
  inscription: MercadoInscription
  receivedAt: Date
}): { subject: string; html: string } {
  const { inscription, receivedAt } = params
  const adminUrl = mercadoAbsoluteUrl(mercadoApplicationsAdminPath())
  const planLabel = mercadoPresencePlanNotifyLabel(inscription.presencePlan)

  const bodyHtml = [
    liquidParagraph(
      `Llegó una <strong>solicitud de registro de local</strong> al directorio del Mercado Municipal San Pablo (${escapeHtml(mercadoInscriptionCanonical())}).`
    ),
    liquidKeyValueTable([
      { label: 'Local', value: inscription.businessName, emphasize: true },
      { label: 'Propietario', value: inscription.merchantName },
      { label: 'Puesto / pasillo', value: inscription.stallNumber },
      { label: 'WhatsApp', value: inscription.whatsapp },
      { label: 'Nivel de presencia', value: planLabel },
      { label: 'Autorización', value: 'Sí · autorizó publicar los datos del comercio' },
      { label: 'Estado', value: 'Recibida · pendiente de revisión' },
      { label: 'Recibido (HN)', value: formatDateTimeForHonduras(receivedAt) },
    ]),
    liquidParagraph(
      `No se creó ficha pública ni cuenta. El plan VIP, si aplica, es intención de presencia: la aportación y el sticker se coordinan a mano. Alta en ${escapeHtml(adminUrl)}.`
    ),
  ].join('')

  return {
    subject: `Solicitud de registro de local — ${inscription.businessName} (local ${inscription.stallNumber})`,
    html: wrapLiquidEmail({
      title: 'Solicitud de registro de local',
      subtitle: 'Mercado Municipal San Pablo',
      badge: 'Directorio',
      bodyHtml,
      footerNote: 'Aviso automático del formulario público. La solicitud queda pendiente de revisión. VIP no significa pago registrado.',
    }),
  }
}
