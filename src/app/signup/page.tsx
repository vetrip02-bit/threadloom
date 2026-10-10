import type { Metadata } from 'next'
import { Suspense } from 'react'

import { ACCOUNTS_ENABLED } from '@/lib/supabase/env'
import { AuthRoute } from '@/components/auth/AuthRoute'
import { AuthPageSkeleton } from '@/components/auth/AuthPageShell'
import { AccountsDisabled } from '@/components/auth/AccountsDisabled'

export const metadata: Metadata = {
  title: 'Sign up',
  description:
    'Create a trade account so your details are filled in automatically on every quote request.',
  alternates: { canonical: '/signup' },
  robots: { index: false, follow: true },
}

export default function SignUpPage() {
  if (!ACCOUNTS_ENABLED) return <AccountsDisabled />

  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <AuthRoute mode="signup" />
    </Suspense>
  )
}
