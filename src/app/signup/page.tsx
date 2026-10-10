import type { Metadata } from 'next'

import { SignUpForm } from '@/components/auth/SignUpForm'
import { AuthPageShell } from '@/components/auth/AuthPageShell'

export const metadata: Metadata = {
  title: 'Create account',
  description:
    'Create a trade account to save your quote bag and speed up repeat uniform enquiries.',
  alternates: { canonical: '/signup' },
  robots: { index: false, follow: true },
}

export default function SignUpPage() {
  return (
    <AuthPageShell
      eyebrow="Create account"
      title="Set up your trade account"
      description="Tell us who you are so quotes reach the right person. An account is optional — you can send an enquiry without one."
    >
      <SignUpForm />
    </AuthPageShell>
  )
}
