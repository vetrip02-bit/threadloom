import type { Metadata } from 'next'

import { SignUpForm } from '@/components/auth/SignUpForm'
import { AuthPageShell } from '@/components/auth/AuthPageShell'
import { safeRedirect } from '@/lib/safe-redirect'

export const metadata: Metadata = {
  title: 'Sign up',
  description:
    'Create a trade account so your details are filled in automatically on every quote request.',
  alternates: { canonical: '/signup' },
  robots: { index: false, follow: true },
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  const returnTo = safeRedirect(next, '/')

  return (
    <AuthPageShell
      href="/signup"
      label="Sign up"
      eyebrow="Create account"
      title="Set up your trade account"
      description="Tell us who you are once. After this, requesting a quote takes a few seconds — your contact details are filled in for you."
    >
      <SignUpForm returnTo={returnTo} />
    </AuthPageShell>
  )
}
