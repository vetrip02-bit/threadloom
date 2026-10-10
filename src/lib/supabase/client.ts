'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ACCOUNTS_ENABLED, SUPABASE_ANON_KEY, SUPABASE_URL } from './env'

let cached: SupabaseClient | null = null

/** Browser client, or null when accounts are disabled for this deployment. */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!ACCOUNTS_ENABLED) return null
  if (!cached) cached = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  return cached
}
