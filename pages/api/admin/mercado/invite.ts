/**
 * Invite locatario: crea/asegura auth user + profile vendor + email de set password.
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireSuperAdmin } from '../../../../lib/auth/api-auth'
import { findAuthUserIdByEmail } from '../../../../lib/auth/find-auth-user'
import { normalizeLoginEmail } from '../../../../lib/auth/role-access'
import { logger } from '../../../../lib/logger'
import {
  APP_LOGIN_PATH,
  AUTH_UPDATE_PASSWORD_PATH,
} from '../../../../lib/mercado/paths'
import { VENDORS_TABLE } from '../../../../lib/mercado/schema'
import { createMercadoAdminClient } from '../../../../lib/mercado/vendors-db'

const bodySchema = z.object({
  vendorId: z.string().uuid(),
})

function siteOrigin(req: NextApiRequest): string {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
  if (configured) return configured
  const proto = (req.headers['x-forwarded-proto'] as string) || 'http'
  const host = req.headers.host || 'localhost:3000'
  return `${proto}://${host}`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const operator = await requireSuperAdmin(req, res, 'mercado.invite')
  if (!operator) return

  const parsed = bodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'vendorId inválido' })
  }

  const admin = createMercadoAdminClient()
  const { data: vendor, error: vendorErr } = await admin
    .from(VENDORS_TABLE)
    .select('id, contact_email, auth_user_id, status, name')
    .eq('id', parsed.data.vendorId)
    .maybeSingle()

  if (vendorErr || !vendor) {
    return res.status(404).json({ error: 'Ficha no encontrada' })
  }
  if (vendor.status === 'inactive') {
    return res.status(400).json({ error: 'La ficha está inactiva' })
  }
  if (vendor.auth_user_id) {
    return res.status(409).json({ error: 'Esa ficha ya tiene un locatario vinculado' })
  }

  const email = vendor.contact_email ? normalizeLoginEmail(vendor.contact_email) : ''
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Guardá un correo de login en la ficha antes de invitar' })
  }

  const redirectTo = `${siteOrigin(req)}${AUTH_UPDATE_PASSWORD_PATH}?next=${encodeURIComponent(APP_LOGIN_PATH)}`

  try {
    let userId = await findAuthUserIdByEmail(admin, email)

    if (!userId) {
      const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo,
      })
      if (inviteErr || !invited.user) {
        logger.error('mercado inviteUserByEmail', { error: inviteErr?.message })
        return res.status(500).json({ error: 'No se pudo enviar la invitación' })
      }
      userId = invited.user.id
    } else {
      const { error: resetErr } = await admin.auth.resetPasswordForEmail(email, { redirectTo })
      if (resetErr) {
        logger.error('mercado resetPasswordForEmail', { error: resetErr.message })
        return res.status(500).json({ error: 'No se pudo enviar el enlace de contraseña' })
      }
    }

    const { error: profileErr } = await admin.from('user_profiles').upsert(
      {
        id: userId,
        role: 'vendor',
        is_active: true,
        permissions: {},
      },
      { onConflict: 'id' }
    )
    if (profileErr) {
      logger.error('mercado invite profile', { error: profileErr.message })
      return res.status(500).json({ error: 'No se pudo crear el perfil del locatario' })
    }

    return res.status(200).json({
      ok: true,
      message: `Invitación enviada a ${email} para ${vendor.name}.`,
      userId,
    })
  } catch (error: unknown) {
    logger.error('mercado invite', {
      error: error instanceof Error ? error.message : 'Unknown',
    })
    return res.status(500).json({ error: 'Error al invitar locatario' })
  }
}
