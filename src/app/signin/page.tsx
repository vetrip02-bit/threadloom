import type { Metadata } from 'next'

import { SignInForm } from '@/components/auth/SignInForm'
import { AuthPageShell } from '@/components/auth/AuthPageShell'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your trade account to manage your profile and quote bag.',
  alternates: { canonical: '/signin' },
  robots: { index: false, follow: true },
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  // Only same-site relative paths are accepted as a redirect target.
  const redirectTo = next && next.startsWith('/') && !next.startsWith('//') ? next : '/account'

  return (
    <AuthPageShell
      eyebrow="Welcome back"
      title="Sign in to your account"
      description="Access your profile, keep your quote bag across devices and pick up where you left off."
    >
      <SignInForm redirectTo={redirectTo} />
    </AuthPageShell>
  )
}
