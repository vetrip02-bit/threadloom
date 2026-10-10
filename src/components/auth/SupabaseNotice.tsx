'use client'

import { Info } from 'lucide-react'
import { isSupabaseConfigured } from '@/lib/supabase/env'

/**
 * Shown only when the Supabase environment variables are missing, so the site
 * can be built and demoed before the project is provisioned.
 */
export function SupabaseNotice() {
  if (isSupabaseConfigured) return null

  return (
    <div className="flex items-start gap-3 rounded-[8px] border border-hairline bg-ivory p-4">
      <Info size={18} strokeWidth={1.7} className="mt-0.5 shrink-0 text-navy" aria-hidden="true" />
      <p className="text-[13px] leading-6 text-charcoal">
        Accounts are not connected on this deployment yet. Add{' '}
        <code className="rounded bg-white px-1 py-0.5 text-[12px] text-navy">
          NEXT_PUBLIC_SUPABASE_URL
        </code>{' '}
        and{' '}
        <code className="rounded bg-white px-1 py-0.5 text-[12px] text-navy">
          NEXT_PUBLIC_SUPABASE_ANON_KEY
        </code>{' '}
        to enable sign-in. You can still request a quote without an account.
      </p>
    </div>
  )
}
