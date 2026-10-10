'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { fieldErrors, signInSchema } from '@/lib/validation/schemas'
import { TextField } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'

/**
 * `returnTo` is already sanitised by safeRedirect() on the server before it
 * reaches this component, so it is always a same-site relative path.
 */
export function SignInForm({ returnTo }: { returnTo: string }) {
  const router = useRouter()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    setErrors({})

    const parsed = signInSchema.safeParse(values)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setFormError('Accounts are unavailable right now. Please try again later.')
      return
    }

    setSubmitting(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    })
    setSubmitting(false)

    if (error) {
      setFormError(
        error.message === 'Email not confirmed'
          ? 'Please confirm your email address first — check your inbox for the link.'
          : // Deliberately generic: never reveal whether an address is registered.
            'That email and password combination did not match. Please try again.',
      )
      return
    }

    // Straight back to whatever they were doing before signing in.
    router.push(returnTo)
    router.refresh()
  }

  const signUpHref = '/signup?next=' + encodeURIComponent(returnTo)

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[8px] border border-burgundy/35 bg-burgundy/5 p-4"
        >
          <AlertCircle
            size={18}
            strokeWidth={1.8}
            className="mt-0.5 shrink-0 text-burgundy"
            aria-hidden="true"
          />
          <p className="text-[13.5px] leading-6 text-navy">{formError}</p>
        </div>
      ) : null}

      <TextField
        label="Business email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={values.email}
        error={errors.email}
        onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        value={values.password}
        error={errors.password}
        onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
      />

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 size={17} className="animate-spin" aria-hidden="true" />
            Logging in
          </>
        ) : (
          'Log in'
        )}
      </Button>

      <p className="text-center text-[13px] text-charcoal">
        New here?{' '}
        <Link
          href={signUpHref}
          className="font-medium text-burgundy underline underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </form>
  )
}
