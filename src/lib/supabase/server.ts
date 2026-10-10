import 'server-only'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { ACCOUNTS_ENABLED, SUPABASE_ANON_KEY, SUPABASE_URL } from './env'
import type { Profile } from '@/types'

/** Server client bound to the request cookie jar, or null when disabled. */
export async function getSupabaseServerClient() {
  if (!ACCOUNTS_ENABLED) return null
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Called from a Server Component; middleware refreshes instead.
        }
      },
    },
  })
}

/**
 * Resolves the authenticated user. `getUser()` revalidates with Supabase, so
 * the result is trustworthy on the server - never derive identity from a
 * request body or a client-supplied field.
 */
export async function getAuthenticatedUser() {
  const supabase = await getSupabaseServerClient()
  if (!supabase) return null
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return data.user
}

/** Loads the profile row for a user id. RLS restricts this to the owner. */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await getSupabaseServerClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error || !data) return null
  return data as Profile
}
