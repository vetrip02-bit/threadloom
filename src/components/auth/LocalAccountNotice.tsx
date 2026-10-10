'use client'

import { Info } from 'lucide-react'

import { useAuth } from '@/components/auth/AuthProvider'

/**
 * States the two real limits of a browser-backed account, on the pages where
 * the customer is deciding to create one.
 *
 * Shown only when no Supabase project is configured. Sign-up and log-in work
 * identically either way; what differs is where the account lives.
 */
export function LocalAccountNotice() {
  const { localMode } = useAuth()
  if (!localMode) return null

  return (
    <div className="flex items-start gap-3 rounded-[8px] border border-hairline bg-ivory p-4">
      <Info size={17} strokeWidth={1.7} className="mt-0.5 shrink-0 text-navy" aria-hidden="true" />
      <div className="text-[12.5px] leading-6 text-charcoal">
        <p>
          <strong className="text-navy">Accounts on this site are stored in your
          browser.</strong>{' '}
          Your password is never kept — only an unreadable derivation of it — but
          your account will not work on another device, and clearing your browser
          data removes it.
        </p>
        <p className="mt-1.5">
          Please use a password you do not use anywhere else.
        </p>
      </div>
    </div>
  )
}
