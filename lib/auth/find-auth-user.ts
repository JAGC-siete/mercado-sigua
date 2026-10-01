import type { SupabaseClient } from '@supabase/supabase-js'
import { normalizeLoginEmail } from './role-access'

/** Busca auth.users por email vía Admin API (sin getUserByEmail en esta versión). */
export async function findAuthUserIdByEmail(
  admin: SupabaseClient,
  email: string
): Promise<string | null> {
  const target = normalizeLoginEmail(email)
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const found = data.users.find((user) => normalizeLoginEmail(user.email || '') === target)
    if (found) return found.id
    if (data.users.length < 200) break
  }
  return null
}
