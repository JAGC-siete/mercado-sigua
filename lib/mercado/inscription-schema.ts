/**
 * Contrato del formulario público de registro de local.
 * Lo comparten el componente y POST /api/mercado/inscriptions.
 * No crea vendor, slug ni ficha: solo una solicitud pendiente de revisión.
 */

import { z } from 'zod'
import { vendorWhatsappSchema } from './schema'

export const VENDOR_APPLICATIONS_TABLE = 'mercado_vendor_applications'
export const VENDOR_APPLICATION_SOURCE = 'mercado-public'
export const VENDOR_APPLICATION_STATUSES = [
  'received',
  'reviewed',
  'approved',
  'rejected',
] as const

export type VendorApplicationStatus = (typeof VENDOR_APPLICATION_STATUSES)[number]

export const MERCADO_PRESENCE_PLANS = ['basic', 'featured_vip'] as const
export type MercadoPresencePlan = (typeof MERCADO_PRESENCE_PLANS)[number]

export const MERCADO_INSCRIPTION_AUTHORIZATION_TEXT =
  'Autorizo publicar los datos de mi comercio en la web oficial del Mercado Municipal y confirmo el plan de presencia elegido.'

export const MERCADO_PRESENCE_PLAN_COPY: Record<
  MercadoPresencePlan,
  { title: string; price: string }
> = {
  basic: {
    title: 'Registro básico',
    price: 'Gratuito',
  },
  featured_vip: {
    title: 'Perfil destacado',
    price: 'Aportación L. 1,500 / año',
  },
}

export function mercadoPresencePlanNotifyLabel(plan: MercadoPresencePlan): string {
  if (plan === 'featured_vip') {
    return 'VIP L. 1,500 (aportación anual; se coordina aparte, no registrada como pago)'
  }
  return 'Básico (gratuito)'
}

export function mercadoPresencePlanAdminLabel(plan: MercadoPresencePlan): string {
  if (plan === 'featured_vip') return 'VIP · L. 1,500 / año'
  return 'Básico'
}

export const mercadoInscriptionSchema = z
  .object({
    stallNumber: z
      .string()
      .trim()
      .min(1, 'Escribe el número de puesto o pasillo.')
      .max(40, 'El número de puesto no puede pasar de 40 caracteres.')
      .refine((value) => /[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(value), {
        message: 'Incluye el número o la ubicación del local.',
      }),
    merchantName: z
      .string()
      .trim()
      .min(2, 'Escribe el nombre del propietario.')
      .max(80, 'El nombre del propietario no puede pasar de 80 caracteres.'),
    businessName: z
      .string()
      .trim()
      .min(2, 'Escribe el nombre del local.')
      .max(80, 'El nombre del local no puede pasar de 80 caracteres.'),
    whatsapp: vendorWhatsappSchema,
    presencePlan: z.enum(MERCADO_PRESENCE_PLANS, {
      message: 'Elegí un nivel de presencia.',
    }),
    authorized: z.literal(true, {
      message: 'Autorizá la publicación de los datos del comercio para enviar la solicitud.',
    }),
    /**
     * Honeypot: el formulario lo pinta oculto y una persona nunca lo llena.
     * Si llega con texto, el endpoint responde éxito sin guardar nada.
     */
    website: z.string().max(200).optional(),
  })
  .strip()

export type MercadoInscriptionInput = z.input<typeof mercadoInscriptionSchema>
export type MercadoInscription = z.output<typeof mercadoInscriptionSchema>

export function parseMercadoInscription(body: unknown) {
  return mercadoInscriptionSchema.safeParse(body)
}

export function looksLikeInscriptionBot(inscription: MercadoInscription): boolean {
  return Boolean(inscription.website && inscription.website.trim().length > 0)
}

export function mercadoInscriptionFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'submit')
    if (!out[key]) out[key] = issue.message
  }
  return out
}

export function mercadoInscriptionToApplicationRow(
  inscription: MercadoInscription,
  receivedAt: Date
) {
  return {
    stall_number: inscription.stallNumber,
    merchant_name: inscription.merchantName,
    business_name: inscription.businessName,
    whatsapp: inscription.whatsapp,
    presence_plan: inscription.presencePlan,
    authorized_at: receivedAt.toISOString(),
    authorization_text: MERCADO_INSCRIPTION_AUTHORIZATION_TEXT,
    status: 'received' as const,
    source: VENDOR_APPLICATION_SOURCE,
  }
}
