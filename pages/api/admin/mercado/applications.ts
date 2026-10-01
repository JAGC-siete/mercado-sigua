/**
 * Bandeja de solicitudes /mercadosanpablosigua/inscripcion.
 * Lee mercado_vendor_applications. No toca leads ni sites.
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireMercadoAdminApi } from '../../../../lib/mercado/admin-auth'
import { logger } from '../../../../lib/logger'
import {
  VENDOR_APPLICATIONS_TABLE,
  VENDOR_APPLICATION_STATUSES,
} from '../../../../lib/mercado/inscription-schema'
import { createMercadoAdminClient } from '../../../../lib/mercado/vendors-db'

const MAX_ROWS = 500

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(VENDOR_APPLICATION_STATUSES),
})

const LIST_COLUMNS =
  'id, stall_number, merchant_name, business_name, whatsapp, presence_plan, authorized_at, authorization_text, status, source, notified_at, created_at, vendor_id'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'PATCH') {
    res.setHeader('Allow', 'GET, PATCH')
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const operator = requireMercadoAdminApi(req, res)
  if (!operator) return

  const adminClient = createMercadoAdminClient()

  try {
    if (req.method === 'GET') {
      const { data, error } = await adminClient
        .from(VENDOR_APPLICATIONS_TABLE)
        .select(LIST_COLUMNS)
        .order('created_at', { ascending: false })
        .limit(MAX_ROWS)

      if (error) {
        logger.error('Error listando solicitudes mercado', { error: error.message })
        return res.status(500).json({ error: 'No se pudieron cargar las solicitudes' })
      }

      return res.status(200).json({ applications: data ?? [] })
    }

    const parsed = patchSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' })
    }

    const { id, status } = parsed.data
    if (status === 'approved') {
      return res.status(400).json({
        error: 'Aprobá creando la ficha desde «Crear ficha».',
      })
    }

    const { data, error } = await adminClient
      .from(VENDOR_APPLICATIONS_TABLE)
      .update({ status })
      .eq('id', id)
      .select('id, status, vendor_id')
      .maybeSingle()

    if (error) {
      logger.error('Error actualizando solicitud mercado', { id, error: error.message })
      return res.status(500).json({ error: 'No se pudo actualizar el estado' })
    }
    if (!data) {
      return res.status(404).json({ error: 'Solicitud no encontrada' })
    }

    return res.status(200).json({ application: data })
  } catch (error: unknown) {
    if (res.headersSent) return
    logger.error('Error en bandeja mercado', {
      error: error instanceof Error ? error.message : 'Unknown',
    })
    return res.status(500).json({ error: 'Error interno' })
  }
}
