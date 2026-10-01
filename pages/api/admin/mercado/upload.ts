/**
 * Upload de logo / fachada al bucket mercado-san-pablo.
 * JSON { kind, contentType, dataBase64 }. JWT super_admin + service role.
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { randomUUID } from 'crypto'
import { requireSuperAdmin } from '../../../../lib/auth/api-auth'
import { logger } from '../../../../lib/logger'
import { MERCADO_STORAGE_BUCKET } from '../../../../lib/mercado/paths'
import { createMercadoAdminClient } from '../../../../lib/mercado/vendors-db'

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_BYTES = 5 * 1024 * 1024

function extFor(mime: string) {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return 'jpg'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const operator = await requireSuperAdmin(req, res, 'mercado.upload')
  if (!operator) return

  const kind = req.body?.kind
  if (kind !== 'logo' && kind !== 'facade' && kind !== 'product') {
    return res.status(400).json({ error: 'kind debe ser logo, facade o product.' })
  }

  const mime = typeof req.body?.contentType === 'string' ? req.body.contentType : ''
  if (!ALLOWED.has(mime)) {
    return res.status(400).json({ error: 'Solo JPEG, PNG o WebP.' })
  }

  const raw = typeof req.body?.dataBase64 === 'string' ? req.body.dataBase64 : ''
  let buffer: Buffer
  try {
    buffer = Buffer.from(raw, 'base64')
  } catch {
    return res.status(400).json({ error: 'Archivo inválido.' })
  }
  if (!buffer.length || buffer.length > MAX_BYTES) {
    return res.status(400).json({ error: 'La imagen supera 5 MB o está vacía.' })
  }

  const path = `vendors/${kind}/${randomUUID()}.${extFor(mime)}`
  const adminClient = createMercadoAdminClient()
  const { error: uploadError } = await adminClient.storage
    .from(MERCADO_STORAGE_BUCKET)
    .upload(path, buffer, { contentType: mime, upsert: false })

  if (uploadError) {
    logger.error('mercado upload', { error: uploadError.message })
    return res.status(500).json({ error: 'No se pudo subir la imagen' })
  }

  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '')
  const publicUrl = `${base}/storage/v1/object/public/${MERCADO_STORAGE_BUCKET}/${path}`

  return res.status(201).json({
    path,
    url: publicUrl,
    alt: kind === 'facade' ? 'Fachada del puesto' : kind === 'logo' ? 'Logo del puesto' : 'Producto',
  })
}
