'use client'

import { useSearchParams } from 'next/navigation'

import { AuthPageShell } from '@/components/auth/AuthPageShell'
import { SignInForm } from '@/components/auth/SignInForm'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { safeRedirect } from '@/lib/safe-redirect'

/**
 * Reads `?next=` on the client.
 *
 * This is a static export, so there is no server to hand us searchParams -
 * and no server to sanitise them either. `safeRedirect` therefore runs here,
 * on exactly the value that will be used, rejecting absolute URLs and other
 * open-redirect attempts before anything navigates.
 */
export function AuthRoute({ mode }: { mode: 'signin' | 'signup' }) {
  const searchParams = useSearchParams()
  const returnTo = safeRedirect(searchParams.get('next'), '/')

  if (mode === 'signup') {
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
