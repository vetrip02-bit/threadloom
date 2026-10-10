import type { Metadata } from 'next'

import { SignInForm } from '@/components/auth/SignInForm'
import { AuthPageShell } from '@/components/auth/AuthPageShell'
import { safeRedirect } from '@/lib/safe-redirect'

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to your trade account to speed up repeat uniform enquiries.',
  alternates: { canonical: '/signin' },
  robots: { index: false, follow: true },
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  const returnTo = safeRedirect(next, '/')

  return (
    <AuthPageShell
      href="/signin"
      label="Log in"
      eyebrow="Welcome back"
      title="Log in to your account"
      description="Your details are filled in for you on every quote, so you never type them twice."
    >
      <SignInForm returnTo={returnTo} />
    </AuthPageShell>
  )
}
