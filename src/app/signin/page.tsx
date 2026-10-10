import type { Metadata } from 'next'
import { Suspense } from 'react'

import { AuthRoute } from '@/components/auth/AuthRoute'
import { AuthPageSkeleton } from '@/components/auth/AuthPageShell'

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to your trade account to speed up repeat uniform enquiries.',
  alternates: { canonical: '/signin' },
  robots: { index: false, follow: true },
}

export default function SignInPage() {
  /*
   * No Supabase gate here: sign-up and log-in work either way. With a
   * Supabase project the account lives on their server; without one it is
   * backed by this browser. AuthProvider picks the backend and the form
   * discloses which is in play.
   */
  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <AuthRoute mode="signin" />
    </Suspense>
  )
}
