import { createBrowserClient } from '@supabase/ssr'

// @supabase/ssr 0.6 types its return with the old SupabaseClient generics; the installed
// supabase-js reordered them (SchemaNameOrClientOptions), so annotating with SupabaseClient no longer compiles.
type BrowserSupabaseClient = ReturnType<typeof createBrowserClient>

let cached: BrowserSupabaseClient | null = null

export function createBrowserSupabaseClient(): BrowserSupabaseClient {
  if (cached) return cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  cached = createBrowserClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
  return cached
}
