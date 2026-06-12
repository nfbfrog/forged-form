import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

let supabaseClientPromise: Promise<SupabaseClient | null> | null = null

export function getSupabase() {
  if (!isSupabaseConfigured) return Promise.resolve(null)
  supabaseClientPromise ??= import('@supabase/supabase-js').then(({ createClient }) => createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }))
  return supabaseClientPromise
}
