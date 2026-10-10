/**
 * Supabase is optional at build time.
 *
 * When it is not configured the entire account system is hidden - no sign-up
 * button, no login page, no fillable form that cannot work. Guest quoting is
 * unaffected. This is deliberate: a feature that cannot function must not be
 * presented to a visitor.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? ''

export const ACCOUNTS_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
