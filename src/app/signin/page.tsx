import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'

import { ACCOUNTS_ENABLED } from '@/lib/supabase/env'
import { AuthRoute } from '@/components/auth/AuthRoute'
import { AuthPageSkeleton } from '@/components/auth/AuthPageShell'

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to your trade account to speed up repeat uniform enquiries.',
  alternates: { canonical: '/signin' },
  robots: { index: false, follow: true },
}

export default function SignInPage() {
  // Built without a Supabase project: the route does not exist at all, rather
  // than rendering a form that cannot work.
  if (!ACCOUNTS_ENABLED) notFound()

  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <AuthRoute mode="signin" />
    </Suspense>
  )
}
