'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

import {
  CheckboxField,
  TextAreaField,
  TextField,
} from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { todayIso } from '@/lib/utils'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const INITIAL = {
  firstName: '',
  lastName: '',
  organization: '',
  email: '',
  phone: '',
  city: '',
  requirements: '',
  estimatedQuantity: '',
  expectedDate: '',
  consent: false,
}

/**
 * Item-free enquiry form shared by the contact and customization pages.
 * It posts to the same validated endpoint as the quote builder, with a
 * different `source` so the CRM record is labelled correctly.
 */
export function EnquiryForm({
  source,
  requirementsLabel,
  requirementsPlaceholder,
  submitLabel,
  successTitle,
  successBody,
}: {
  source: 'contact' | 'customization'
  requirementsLabel: string
  requirementsPlaceholder: string
  submitLabel: string
  successTitle: string
  successBody: string
}) {
  const [values, setValues] = useState(INITIAL)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [formError, setFormError] = useState('')
  const [reference, setReference] = useState('')
  const [honeypot, setHoneypot] = useState('')

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
    setStatus('submitting')
    setFormError('')
    setErrors({})

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          source,
          items: [],
          company_website: honeypot,
        }),
      })

      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean
        reference?: string
        errors?: Record<string, string>
        message?: string
      }

      if (!response.ok || !payload.ok) {
        if (payload.errors) setErrors(payload.errors)
        setFormError(
          payload.message ??
            'We could not send your enquiry. Please try again, or email us directly.',
        )
        setStatus('error')
        return
      }

      setReference(payload.reference ?? '')
      setStatus('success')
      setValues(INITIAL)
    } catch {
      setFormError('We could not reach the server. Check your connection and try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="rounded-card border border-hairline bg-white p-8">
        <CheckCircle2 size={28} strokeWidth={1.5} className="text-burgundy" aria-hidden="true" />
        <h3 className="mt-4 text-[20px]">{successTitle}</h3>
        <p className="mt-3 max-w-xl text-[14.5px] leading-7 text-charcoal">{successBody}</p>
        {reference ? (
          <p className="mt-4 text-[13.5px] text-charcoal">
            Your reference:{' '}
            <span className="font-semibold tabular-nums text-navy">{reference}</span>
          </p>
        ) : null}
        <Button variant="secondary" className="mt-6" onClick={() => setStatus('idle')}>
          Send another enquiry
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <fieldset disabled={status === 'submitting'} className="space-y-6">
        <legend className="sr-only">Enquiry details</legend>

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
          label="Organization"
          autoComplete="organization"
          required
          value={values.organization}
          error={errors.organization}
          onChange={(e) => set('organization', e.target.value)}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Business email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            error={errors.email}
            onChange={(e) => set('email', e.target.value)}
          />
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
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="City"
            autoComplete="address-level2"
            required
            value={values.city}
            error={errors.city}
            onChange={(e) => set('city', e.target.value)}
          />
          <TextField
            label="Estimated quantity"
            type="number"
            inputMode="numeric"
            min={1}
            required
            hint="Approximate total pieces."
            value={values.estimatedQuantity}
            error={errors.estimatedQuantity}
            onChange={(e) => set('estimatedQuantity', e.target.value)}
          />
        </div>

        <TextField
          label="Expected delivery date"
          type="date"
          min={todayIso()}
          value={values.expectedDate}
          error={errors.expectedDate}
          onChange={(e) => set('expectedDate', e.target.value)}
        />

        <TextAreaField
          label={requirementsLabel}
          required
          placeholder={requirementsPlaceholder}
          hint="At least 10 characters."
          value={values.requirements}
          error={errors.requirements}
          onChange={(e) => set('requirements', e.target.value)}
        />

        {/* Honeypot */}
        <div aria-hidden="true" className="hidden">
          <label htmlFor={source + '-company_website'}>Company website</label>
          <input
            id={source + '-company_website'}
            name="company_website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <CheckboxField
          checked={values.consent}
          error={errors.consent}
          onChange={(e) => set('consent', e.target.checked)}
          label={
            <>
              I agree to be contacted about this enquiry and accept the{' '}
              <Link
                href="/privacy"
                className="font-medium text-burgundy underline underline-offset-4"
              >
                privacy policy
              </Link>
              .
            </>
          }
        />

        <Button type="submit" size="lg" disabled={status === 'submitting'}>
          {status === 'submitting' ? (
            <>
              <Loader2 size={17} className="animate-spin" aria-hidden="true" />
              Sending
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </fieldset>
    </form>
  )
}
