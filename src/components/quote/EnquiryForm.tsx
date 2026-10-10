'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2 } from 'lucide-react'

import {
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/ui/Field'
import { CUSTOMER_TYPES } from '@/data/catalog'
import type { CustomerType } from '@/types'
import { Button } from '@/components/ui/Button'
import { DeliveryFallback } from '@/components/quote/DeliveryFallback'
import { useAuth } from '@/components/auth/AuthProvider'
import { SignedInContact } from '@/components/quote/SignedInContact'
import { isContactComplete, prefillFromProfile } from '@/lib/profile-prefill'
import { todayIso } from '@/lib/utils'
import { submitEnquiry } from '@/lib/enquiry'
import { quoteRequestSchema, fieldErrors } from '@/lib/validation/schemas'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const INITIAL = {
  firstName: '',
  lastName: '',
  organization: '',
  email: '',
  phone: '',
  city: '',
  customerType: '' as CustomerType | '',
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
  const { user, profile, loading: authLoading } = useAuth()
  const [values, setValues] = useState(INITIAL)
  /** True once the customer chooses to edit the prefilled details. */
  const [editingContact, setEditingContact] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [formError, setFormError] = useState('')
  const [reference, setReference] = useState('')
  const [honeypot, setHoneypot] = useState('')

  /*
   * Fill the contact fields from the signed-in customer's saved profile.
   * `prefillFromProfile` never overwrites something already typed, so this is
   * safe to re-run when the profile arrives after the first render.
   */
  useEffect(() => {
    if (!user) return
    setValues((current) => ({
      ...current,
      ...prefillFromProfile(profile, user.email, {
        firstName: current.firstName,
        lastName: current.lastName,
        organization: current.organization,
        email: current.email,
        phone: current.phone,
        city: current.city,
        customerType: current.customerType,
      }),
    }))
  }, [user, profile])

  const contact = {
    firstName: values.firstName,
    lastName: values.lastName,
    organization: values.organization,
    email: values.email,
    phone: values.phone,
    city: values.city,
    customerType: values.customerType,
  }
  /*
   * A signed-in customer with a complete profile confirms their details
   * instead of retyping them. Everyone else gets the full fieldset.
   */
  const showContactSummary =
    Boolean(user) && !authLoading && !editingContact && isContactComplete(contact)

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

    const parsed = quoteRequestSchema.safeParse({
      ...values,
      source,
      items: [],
      company_website: honeypot,
    })

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      setStatus('idle')
      return
    }

    if (parsed.data.company_website) {
      setStatus('success')
      return
    }

    const outcome = await submitEnquiry(parsed.data)
    if (!outcome.ok) {
      setFormError(outcome.message)
      setStatus('error')
      return
    }

    setReference(outcome.reference)
    setStatus('success')
    setValues(INITIAL)
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

        {formError ? <DeliveryFallback message={formError} /> : null}

        {showContactSummary ? (
          <SignedInContact contact={contact} onEdit={() => setEditingContact(true)} />
        ) : (
          <>
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

          <SelectField
            label="Customer type"
            required
            placeholder="Select the closest match"
            options={CUSTOMER_TYPES}
            value={values.customerType}
            error={errors.customerType}
            onChange={(e) => set('customerType', e.target.value as CustomerType)}
          />
          </>
        )}

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
