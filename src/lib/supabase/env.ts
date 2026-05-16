export function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL.')
  }

  if (!supabaseKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Legacy NEXT_PUBLIC_SUPABASE_ANON_KEY is also supported as a fallback.'
    )
  }

  return { supabaseKey, supabaseUrl }
}
