import 'server-only'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './env'
import type { Profile } from '@/types'

/**
 * Server Supabase client bound to the request cookie jar.
 * Returns null when the project is not configured.
 */
export async function getSupabaseServerClient() {
  if (!isSupabaseConfigured) return null
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
          // Called from a Server Component: middleware refreshes the session
          // instead, so this is safe to ignore.
        }
      },
    },
  })
}

/**
 * Resolves the authenticated user from the session cookie.
 * `getUser()` revalidates with Supabase, so the result is trustworthy on the
 * server - never derive identity from a request body.
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
