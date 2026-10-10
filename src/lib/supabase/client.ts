'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './env'

let cached: SupabaseClient | null = null

/**
 * Browser Supabase client. Returns null when the project is not configured so
 * callers can render a setup notice rather than throwing.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  if (!cached) cached = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  return cached
}
