/**
 * Recibe solicitudes de registro de local al directorio /mercadosanpablosigua.
 * Sin sesión. No crea vendor ni escribe en leads/sites.
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { logger } from '../../../lib/logger'
import { maskEmail } from '../../../lib/privacy'
import { PUBLIC_LEAD_LIMIT, withRateLimit } from '../../../lib/rate-limit'
import { getResendFrom } from '../../../lib/resend-from'
import { createAdminClient } from '../../../lib/supabase/admin'
import {
  buildMercadoInscriptionNotification,
  mercadoInscriptionNotifyEmail,
} from '../../../lib/mercado/inscription-email'
import {
  looksLikeInscriptionBot,
  mercadoInscriptionFieldErrors,
  mercadoInscriptionToApplicationRow,
  parseMercadoInscription,
  VENDOR_APPLICATIONS_TABLE,
} from '../../../lib/mercado/inscription-schema'

const MAX_BODY_BYTES = 8 * 1024
const BURST_WINDOW_MS = 60 * 1000
const BURST_MAX = 8

type Supabase = ReturnType<typeof createAdminClient>

async function hasRecentBurst(supabase: Supabase): Promise<boolean> {
  const since = new Date(Date.now() - BURST_WINDOW_MS).toISOString()
  const { count, error } = await supabase
    .from(VENDOR_APPLICATIONS_TABLE)
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since)

  if (error) {
    logger.warn('No se pudo verificar ráfaga de solicitudes de inscripción', { error: error.message })
    return false
  }

  return (count ?? 0) >= BURST_MAX
}

async function sendNotification(params: {
  to: string
  subject: string
  html: string
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { ok: false, error: 'RESEND_API_KEY ausente' }

  const { Resend } = await import('resend')
  const resend = new Resend(apiKey)
  const sent = await resend.emails.send({
    from: getResendFrom(),
    to: params.to,
    subject: params.subject,
    html: params.html,
  })

  return sent.error ? { ok: false, error: sent.error.message } : { ok: true }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ success: false, error: 'Método no permitido' })
  }

  const contentLength = Number(req.headers['content-length'] ?? 0)
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return res.status(413).json({ success: false, error: 'Solicitud demasiado grande' })
  }

  const parsed = parseMercadoInscription(req.body)
  if (!parsed.success) {
    const fields = mercadoInscriptionFieldErrors(parsed.error)
    return res.status(400).json({
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Datos inválidos',
      fields,
    })
  }

  const inscription = parsed.data

  if (looksLikeInscriptionBot(inscription)) {
    logger.info('Solicitud de inscripción descartada por honeypot')
    return res.status(200).json({
      success: true,
      message: 'Solicitud recibida',
    })
  }

  let supabase: ReturnType<typeof createAdminClient>
  try {
    supabase = createAdminClient()
  } catch (err: unknown) {
    logger.error('Cliente admin no disponible para inscripción', {
      error: err instanceof Error ? err.message : 'Unknown',
    })
    return res.status(503).json({
      success: false,
      error: 'No se pudo registrar la solicitud',
    })
  }

  const receivedAt = new Date()

  if (await hasRecentBurst(supabase)) {
    logger.warn('Ráfaga de solicitudes de inscripción al directorio')
    return res.status(429).json({
      success: false,
      error: 'Demasiados envíos. Intenta en unos minutos.',
    })
  }

  let applicationId: string
  try {
    const { data, error } = await supabase
      .from(VENDOR_APPLICATIONS_TABLE)
      .insert(mercadoInscriptionToApplicationRow(inscription, receivedAt))
      .select('id')
      .single()

    if (error) throw new Error(error.message)
    applicationId = (data as { id: string }).id
  } catch (err: unknown) {
    logger.error('No se pudo guardar la solicitud de inscripción', {
      error: err instanceof Error ? err.message : 'Unknown',
    })
    return res.status(500).json({
      success: false,
      error: 'No se pudo registrar la solicitud',
    })
  }

  const notifyEmail = mercadoInscriptionNotifyEmail()
  const mail = buildMercadoInscriptionNotification({ inscription, receivedAt })

  try {
    const sent = await sendNotification({
      to: notifyEmail,
      subject: mail.subject,
      html: mail.html,
    })

    if (sent.ok) {
      await supabase
        .from(VENDOR_APPLICATIONS_TABLE)
        .update({ notified_at: new Date().toISOString() })
        .eq('id', applicationId)
    } else {
      logger.error('Aviso de inscripción no enviado', {
        applicationId,
        to: maskEmail(notifyEmail),
        error: sent.error,
      })
    }
  } catch (err: unknown) {
    logger.error('Error enviando el aviso de inscripción', {
      applicationId,
      error: err instanceof Error ? err.message : 'Unknown',
    })
  }

  logger.info('Solicitud de inscripción recibida', { applicationId })

  return res.status(200).json({
    success: true,
    message: 'Solicitud recibida',
  })
}

export default withRateLimit(PUBLIC_LEAD_LIMIT, handler)
