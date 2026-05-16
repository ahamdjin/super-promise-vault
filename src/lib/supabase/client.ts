import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseEnv } from '@/lib/supabase/env'

export function createClient() {
  const { supabaseKey, supabaseUrl } = getSupabaseEnv()
  return createBrowserClient(supabaseUrl, supabaseKey)
}
