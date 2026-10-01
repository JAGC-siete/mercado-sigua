import { createAdminClient } from '../supabase/admin'
import { VENDORS_TABLE } from '../mercado/schema'
import { normalizeLoginEmail } from './role-access'

export type ClaimedVendor = {
  id: string
  status: string
  contact_email: string | null
  auth_user_id: string | null
}

export async function resolveOrClaimVendor(
  userId: string,
  email: string | null
): Promise<ClaimedVendor | null> {
  const admin = createAdminClient()

  const { data: linked } = await admin
    .from(VENDORS_TABLE)
    .select('id, status, contact_email, auth_user_id')
    .eq('auth_user_id', userId)
    .maybeSingle()

  if (linked) {
    if (linked.status === 'inactive') return null
    return linked as ClaimedVendor
  }

  const normalized = email ? normalizeLoginEmail(email) : ''
  if (!normalized) return null

  const { data: byEmail } = await admin
    .from(VENDORS_TABLE)
    .select('id, status, contact_email, auth_user_id')
    .eq('status', 'active')
    .is('auth_user_id', null)
    .ilike('contact_email', normalized)
    .maybeSingle()

  if (!byEmail) return null

  const { data: claimed, error } = await admin
    .from(VENDORS_TABLE)
    .update({
      auth_user_id: userId,
      claimed_at: new Date().toISOString(),
    })
    .eq('id', byEmail.id)
    .is('auth_user_id', null)
    .select('id, status, contact_email, auth_user_id')
    .maybeSingle()

  if (error || !claimed) return null
  return claimed as ClaimedVendor
}
