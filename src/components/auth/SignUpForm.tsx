'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { signUpSchema, fieldErrors } from '@/lib/validation/schemas'
import { CUSTOMER_TYPES } from '@/data/catalog'
import {
  CheckboxField,
  SelectField,
  TextField,
} from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { useQuote } from '@/components/quote/QuoteProvider'
import { SupabaseNotice } from '@/components/auth/SupabaseNotice'
import type { CustomerType } from '@/types'

const INITIAL = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  organization: '',
  customerType: '' as CustomerType | '',
  city: '',
  password: '',
  consent: false,
}

export function SignUpForm({
  onSuccess,
  onSwitch,
}: {
  onSuccess?: () => void
  onSwitch?: () => void
}) {
  const router = useRouter()
  const { mergeGuestBag } = useQuote()
  const [values, setValues] = useState(INITIAL)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  function set<K extends keyof typeof INITIAL>(key: K, value: (typeof INITIAL)[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key as string]
      return next
    })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    setErrors({})

    const parsed = signUpSchema.safeParse(values)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setFormError('Account creation is not configured on this deployment yet.')
      return
    }

    setSubmitting(true)
    const input = parsed.data

    /*
     * Non-secret profile fields travel as auth metadata so the database
     * trigger can seed `public.profiles` in the same transaction as the user
     * row. The password stays inside Supabase Auth and is never persisted,
     * logged or forwarded to the CRM.
     */
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          first_name: input.firstName,
          last_name: input.lastName,
          phone: input.phone,
          organization: input.organization,
          customer_type: input.customerType,
          city: input.city,
          consent_at: new Date().toISOString(),
        },
        emailRedirectTo:
          typeof window !== 'undefined' ? window.location.origin + '/account' : undefined,
      },
    })
    setSubmitting(false)

    if (error) {
      setFormError(
        error.message.toLowerCase().includes('already')
          ? 'An account already exists for that email address. Try signing in instead.'
          : 'We could not create the account. Please check your details and try again.',
      )
      return
    }

    // With email confirmation on, Supabase returns a user but no session.
    if (data.user && !data.session) {
      setNeedsConfirmation(true)
      return
    }

    if (data.user) mergeGuestBag(data.user.id)
    onSuccess?.()
    router.push('/account')
    router.refresh()
  }

  if (needsConfirmation) {
    return (
      <div role="status" className="rounded-card border border-hairline bg-ivory p-6">
        <CheckCircle2 size={26} strokeWidth={1.5} className="text-burgundy" aria-hidden="true" />
        <h3 className="mt-4 text-[18px]">Confirm your email</h3>
        <p className="mt-2 text-[14px] leading-7 text-charcoal">
          We have sent a confirmation link to{' '}
          <span className="font-medium text-navy">{values.email}</span>. Open it to
          activate your account, then sign in.
        </p>
        {onSwitch ? (
          <Button variant="secondary" className="mt-5 w-full" onClick={onSwitch}>
            Back to sign in
          </Button>
        ) : (
          <Link
            href="/signin"
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-[8px] border border-navy text-[14px] font-medium text-navy transition-colors hover:bg-navy hover:text-white"
          >
            Back to sign in
          </Link>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <SupabaseNotice />

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

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="First name"
          autoComplete="given-name"
          required
          value={values.firstName}
          error={errors.firstName}
          onChange={(e) => set('firstName', e.target.value)}
        />
        <TextField
          label="Last name"
          autoComplete="family-name"
          required
          value={values.lastName}
          error={errors.lastName}
          onChange={(e) => set('lastName', e.target.value)}
        />
      </div>

      <TextField
        label="Business email"
        type="email"
        autoComplete="email"
        required
        value={values.email}
        error={errors.email}
        onChange={(e) => set('email', e.target.value)}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Phone"
          type="tel"
          autoComplete="tel"
          required
          placeholder="+91 00000 00000"
          value={values.phone}
          error={errors.phone}
          onChange={(e) => set('phone', e.target.value)}
        />
        <TextField
          label="City"
          autoComplete="address-level2"
          required
          value={values.city}
          error={errors.city}
          onChange={(e) => set('city', e.target.value)}
        />
      </div>

      <TextField
        label="Organization"
        autoComplete="organization"
        required
        value={values.organization}
        error={errors.organization}
        onChange={(e) => set('organization', e.target.value)}
      />

      <SelectField
        label="Customer type"
        required
        placeholder="Select the closest match"
        options={CUSTOMER_TYPES}
        value={values.customerType}
        error={errors.customerType}
        onChange={(e) => set('customerType', e.target.value as CustomerType)}
      />

      <TextField
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        hint="At least 10 characters, with an uppercase letter, a lowercase letter and a number."
        value={values.password}
        error={errors.password}
        onChange={(e) => set('password', e.target.value)}
      />

      <CheckboxField
        checked={values.consent}
        error={errors.consent}
        onChange={(e) => set('consent', e.target.checked)}
        label={
          <>
            I accept the{' '}
            <Link href="/privacy" className="font-medium text-burgundy underline underline-offset-4">
              privacy policy
            </Link>{' '}
            and agree that my contact details may be stored in the company CRM so the
            sales team can respond to my enquiries.
          </>
        }
      />

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 size={17} className="animate-spin" aria-hidden="true" />
            Creating account
          </>
        ) : (
          'Create account'
        )}
      </Button>

      <p className="text-center text-[13px] text-charcoal">
        Already registered?{' '}
        {onSwitch ? (
          <button
            type="button"
            onClick={onSwitch}
            className="font-medium text-burgundy underline underline-offset-4"
          >
            Sign in
          </button>
        ) : (
          <Link href="/signin" className="font-medium text-burgundy underline underline-offset-4">
            Sign in
          </Link>
        )}
      </p>
    </form>
  )
}
