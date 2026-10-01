import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuthApi } from '../../../lib/auth/api-auth'
import { touchUserSession } from '../../../lib/auth/session-manager'
import { SESSION_IDLE_MINUTES } from '../../../lib/auth/role-access'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const auth = await requireAuthApi(req, res)
  if (!auth) return

  const sessionId =
    typeof req.body?.session_id === 'string' ? req.body.session_id : null

  if (!sessionId) {
    return res.status(200).json({ ok: true, idleMinutes: SESSION_IDLE_MINUTES })
  }

  const alive = await touchUserSession(sessionId)
  if (!alive) {
    return res.status(440).json({ error: 'Sesión expirada por inactividad' })
  }

  return res.status(200).json({ ok: true, idleMinutes: SESSION_IDLE_MINUTES })
}
