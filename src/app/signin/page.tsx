import type { Metadata } from 'next'
import { Suspense } from 'react'

import { ACCOUNTS_ENABLED } from '@/lib/supabase/env'
import { AuthRoute } from '@/components/auth/AuthRoute'
import { AuthPageSkeleton } from '@/components/auth/AuthPageShell'
import { AccountsDisabled } from '@/components/auth/AccountsDisabled'

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to your trade account to speed up repeat uniform enquiries.',
  alternates: { canonical: '/signin' },
  robots: { index: false, follow: true },
}

export default function SignInPage() {
  // Built without a Supabase project: explain, rather than render a form that
  // cannot work (or a soft 404 that returns 200).
  if (!ACCOUNTS_ENABLED) return <AccountsDisabled />

  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <AuthRoute mode="signin" />
    </Suspense>
  )
}
