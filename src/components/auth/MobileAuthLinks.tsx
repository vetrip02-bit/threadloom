'use client'

import Link from 'next/link'

import { useAuth } from '@/components/auth/AuthProvider'
import { useReturnTo } from '@/components/auth/HeaderAuth'
import { ButtonLink } from '@/components/ui/Button'

/** Log in / Sign up inside the mobile drawer. Hidden when accounts are off. */
export function MobileAuthLinks({ onNavigate }: { onNavigate: () => void }) {
  const { user, profile, loading, enabled, signOut } = useAuth()
  const returnTo = useReturnTo()

  if (!enabled || loading) return null

  if (!user) {
    const next = '?next=' + encodeURIComponent(returnTo)
    return (
      <div className="grid grid-cols-2 gap-3">
        <ButtonLink
          href={'/signin' + next}
          variant="ghost"
          className="w-full"
          onClick={onNavigate}
        >
          Log in
        </ButtonLink>
        <ButtonLink
          href={'/signup' + next}
          variant="secondary"
          className="w-full"
          onClick={onNavigate}
        >
          Sign up
        </ButtonLink>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="truncate text-[12.5px] text-charcoal">
        Signed in as{' '}
        <span className="font-medium text-navy">
          {profile?.first_name?.trim() || user.email}
        </span>
      </p>
      <Link
        href="/account"
        onClick={onNavigate}
        className="inline-flex h-11 w-full items-center justify-center rounded-[8px] border border-hairline text-[14px] font-medium text-navy transition-colors hover:border-navy"
      >
        My account
      </Link>
      <button
        type="button"
        onClick={async () => {
          onNavigate()
          await signOut()
        }}
        className="h-10 w-full text-[13px] text-charcoal underline-offset-4 transition-colors hover:text-burgundy hover:underline"
      >
        Log out
      </button>
    </div>
  )
}
