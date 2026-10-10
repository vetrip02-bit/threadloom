/**
 * Supabase is optional at build time so the site can be built and browsed
 * before the project is provisioned. Auth-dependent UI checks this flag and
 * shows a configuration notice instead of crashing.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
