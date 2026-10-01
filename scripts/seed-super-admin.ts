/**
 * Crea el primer super_admin con service role.
 * Credenciales solo por env (nunca en el repo).
 *
 * Uso:
 *   SEED_SUPER_ADMIN_EMAIL=... SEED_SUPER_ADMIN_PASSWORD=... \
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   npx tsx scripts/seed-super-admin.ts
 */

import { createClient } from '@supabase/supabase-js'
import { findAuthUserIdByEmail } from '../lib/auth/find-auth-user'

function required(name: string): string {
  const value = (process.env[name] || '').trim()
  if (!value) {
    console.error(`Falta ${name}`)
    process.exit(1)
  }
  return value
}

async function main() {
  const url = required('NEXT_PUBLIC_SUPABASE_URL')
  const serviceKey = required('SUPABASE_SERVICE_ROLE_KEY')
  const email = required('SEED_SUPER_ADMIN_EMAIL').toLowerCase()
  const password = required('SEED_SUPER_ADMIN_PASSWORD')

  if (!email.includes('@')) {
    console.error('SEED_SUPER_ADMIN_EMAIL inválido')
    process.exit(1)
  }
  if (password.length < 8) {
    console.error('SEED_SUPER_ADMIN_PASSWORD debe tener al menos 8 caracteres')
    process.exit(1)
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  let userId = await findAuthUserIdByEmail(admin, email)

  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (error || !data.user) {
      console.error('No se pudo crear el usuario:', error?.message)
      process.exit(1)
    }
    userId = data.user.id
    console.info('Usuario auth creado:', userId)
  } else {
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
    })
    if (error) {
      console.error('No se pudo actualizar password:', error.message)
      process.exit(1)
    }
    console.info('Usuario auth existente actualizado:', userId)
  }

  const { error: profileErr } = await admin.from('user_profiles').upsert(
    {
      id: userId,
      role: 'super_admin',
      is_active: true,
      permissions: {},
    },
    { onConflict: 'id' }
  )
  if (profileErr) {
    console.error('No se pudo upsert user_profiles:', profileErr.message)
    process.exit(1)
  }

  console.info('super_admin listo. Login en /app/login')
  console.info('Tras verificar, borrá MERCADO_ADMIN_* del servicio.')
}

void main()
