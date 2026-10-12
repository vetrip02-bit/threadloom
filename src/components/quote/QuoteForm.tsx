'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2, Trash2 } from 'lucide-react'

import { useQuote } from '@/components/quote/QuoteProvider'
import { BRANDING_METHODS, CUSTOMER_TYPES } from '@/data/catalog'
import {
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/ui/Field'
import { Button, ButtonLink } from '@/components/ui/Button'
import { DeliveryFallback } from '@/components/quote/DeliveryFallback'
import { useAuth } from '@/components/auth/AuthProvider'
import { SignedInContact } from '@/components/quote/SignedInContact'
import {
  isContactComplete,
  prefillFromLocalAccount,
  prefillFromProfile,
} from '@/lib/profile-prefill'
import { formatQuantity, todayIso } from '@/lib/utils'
import { submitEnquiry } from '@/lib/enquiry'
import { quoteRequestSchema, fieldErrors } from '@/lib/validation/schemas'
import type { BrandingMethod, CustomerType } from '@/types'

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

export function QuoteForm() {
  const { items, removeItem, updateItem, totalPieces, clear } = useQuote()
  const { user, profile, localAccount, signedIn, loading: authLoading } = useAuth()
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
    if (!signedIn) return
    setValues((current) => {
      const typed = {
        firstName: current.firstName,
        lastName: current.lastName,
        organization: current.organization,
        email: current.email,
        phone: current.phone,
        city: current.city,
        customerType: current.customerType,
      }
      // A real account always wins over device-local details.
      const filled = user
        ? prefillFromProfile(profile, user.email, typed)
        : prefillFromLocalAccount(localAccount, typed)
      return { ...current, ...filled }
    })
  }, [user, profile, localAccount, signedIn])

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
    signedIn &&
    !authLoading &&
    !editingContact &&
    isContactComplete(contact)

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

    /*
     * This is a fully static build with no server, so validation that used to
     * run in the API route now runs here before anything is sent.
     */
    const parsed = quoteRequestSchema.safeParse({
      ...values,
      estimatedQuantity: values.estimatedQuantity || totalPieces || 0,
      source: 'quote',
      company_website: honeypot,
      items: items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        category: item.category,
        quantity: item.quantity,
        color: item.color,
        sizes: item.sizes,
        brandingMethod: item.brandingMethod,
        notes: item.notes,
      })),
    })

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      setStatus('idle')
      return
    }

    // Honeypot filled in: look successful to the bot, send nothing.
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
    clear()
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        className="rounded-card border border-hairline bg-ivory p-8 md:p-12"
      >
        <CheckCircle2
          size={30}
          strokeWidth={1.5}
          className="text-burgundy"
          aria-hidden="true"
        />
        <h2 className="mt-5 text-[22px] md:text-[26px]">Enquiry received</h2>
        <p className="mt-3 max-w-xl text-[15px] leading-7 text-charcoal">
          Thank you - your requirement has reached our sales desk. We will come back
          with fabric options, branding recommendations and a written quote.
        </p>
        {reference ? (
          <p className="mt-4 text-[13.5px] text-charcoal">
            Your reference:{' '}
            <span className="font-semibold tabular-nums text-navy">{reference}</span>
          </p>
        ) : null}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/uniforms" variant="secondary">
            Browse more uniforms
          </ButtonLink>
          <ButtonLink href="/" variant="ghost">
            Back to home
          </ButtonLink>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.78fr)] lg:gap-14">
      <form onSubmit={handleSubmit} noValidate className="order-2 lg:order-1">
        <fieldset disabled={status === 'submitting'} className="space-y-6">
          <legend className="sr-only">Quote request details</legend>

          {formError ? <DeliveryFallback message={formError} /> : null}

          {showContactSummary ? (
            <SignedInContact
              contact={contact}
              onEdit={() => setEditingContact(true)}
            />
          ) : (
            <>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="First name"
                name="firstName"
                autoComplete="given-name"
                required
                value={values.firstName}
                error={errors.firstName}
                onChange={(e) => set('firstName', e.target.value)}
              />
              <TextField
                label="Last name"
                name="lastName"
                autoComplete="family-name"
                required
                value={values.lastName}
                error={errors.lastName}
                onChange={(e) => set('lastName', e.target.value)}
              />
            </div>

            <TextField
              label="Organization"
              name="organization"
              autoComplete="organization"
              required
              placeholder="School, company or agency name"
              value={values.organization}
              error={errors.organization}
              onChange={(e) => set('organization', e.target.value)}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Business email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={values.email}
                error={errors.email}
                onChange={(e) => set('email', e.target.value)}
              />
              <TextField
                label="Phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                placeholder="+91 00000 00000"
                value={values.phone}
                error={errors.phone}
                onChange={(e) => set('phone', e.target.value)}
              />
            </div>

            <TextField
              label="City"
              name="city"
              autoComplete="address-level2"
              required
              value={values.city}
              error={errors.city}
              onChange={(e) => set('city', e.target.value)}
            />

            <SelectField
              label="Customer type"
              name="customerType"
              required
              placeholder="Select the closest match"
              options={CUSTOMER_TYPES}
              value={values.customerType}
              error={errors.customerType}
              onChange={(e) => set('customerType', e.target.value as CustomerType)}
            />
            </>
          )}

          {/* Order details are required for every enquiry, including signed-in
              customers whose saved contact details are shown as a summary. */}
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Estimated quantity"
              name="estimatedQuantity"
              type="number"
              inputMode="numeric"
              min={1}
              required
              hint={
                totalPieces > 0
                  ? 'Your bag currently totals ' + formatQuantity(totalPieces) + ' pieces.'
                  : 'Total pieces across all items.'
              }
              value={values.estimatedQuantity}
              error={errors.estimatedQuantity}
              onChange={(e) => set('estimatedQuantity', e.target.value)}
            />

            <TextField
              label="Expected delivery date"
              name="expectedDate"
              type="date"
              min={todayIso()}
              hint="Helps us plan production backwards from your deadline."
              value={values.expectedDate}
              error={errors.expectedDate}
              onChange={(e) => set('expectedDate', e.target.value)}
            />
          </div>

          <TextAreaField
            label="Requirements"
            name="requirements"
            required
            placeholder="Roles to be dressed, garments, colours, size mix, branding and anything else we should know."
            hint="At least 10 characters."
            value={values.requirements}
            error={errors.requirements}
            onChange={(e) => set('requirements', e.target.value)}
          />

          {/* Honeypot: visually and semantically hidden from real users. */}
          <div aria-hidden="true" className="hidden">
            <label htmlFor="company_website">Company website</label>
            <input
              id="company_website"
              name="company_website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <CheckboxField
            name="consent"
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

          <div className="flex flex-col gap-4 border-t border-hairline pt-6 sm:flex-row sm:items-center">
            <Button type="submit" size="lg" disabled={status === 'submitting'}>
              {status === 'submitting' ? (
                <>
                  <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                  Sending enquiry
                </>
              ) : (
                'Submit quote request'
              )}
            </Button>
            <p className="text-[12.5px] leading-6 text-charcoal/80">
              No payment is taken here. We reply with a written quote.
            </p>
          </div>
        </fieldset>
      </form>

      <aside className="order-1 lg:order-2" aria-label="Items in your quote">
        <div className="rounded-card border border-hairline bg-white p-6 lg:sticky lg:top-28">
          <h2 className="text-[16px] font-semibold text-navy">
            Items in this enquiry
            {items.length > 0 ? (
              <span className="ml-1.5 font-normal text-charcoal">({items.length})</span>
            ) : null}
          </h2>

          {items.length === 0 ? (
            <div className="mt-5">
              <p className="text-[13.5px] leading-7 text-charcoal">
                Your quote bag is empty. You can still send a requirement in the form -
                or add items first so we can price specific lines.
              </p>
              <ButtonLink href="/uniforms" variant="ghost" size="sm" className="mt-4">
                Browse uniforms
              </ButtonLink>
            </div>
          ) : (
            <>
              <ul className="mt-5 divide-y divide-hairline border-y border-hairline">
                {items.map((item) => (
                  <li key={item.key} className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/80">
                          {item.categoryLabel}
                        </p>
                        <h3 className="mt-0.5 text-[14px] font-medium text-navy">
                          {item.productName}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label={'Remove ' + item.productName}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] text-charcoal transition-colors hover:bg-ivory hover:text-burgundy"
                      >
                        <Trash2 size={15} strokeWidth={1.6} aria-hidden="true" />
                      </button>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <TextField
                        label="Quantity"
                        type="number"
                        min={1}
                        required
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.key, {
                            quantity: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                      />
                      <TextField
                        label="Colour"
                        value={item.color}
                        onChange={(e) => updateItem(item.key, { color: e.target.value })}
                      />
                      <TextField
                        label="Sizes"
                        placeholder="e.g. 10 S, 20 M, 15 L"
                        value={item.sizes}
                        onChange={(e) => updateItem(item.key, { sizes: e.target.value })}
                      />
                      <SelectField
                        label="Branding"
                        required
                        options={BRANDING_METHODS}
                        value={item.brandingMethod}
                        onChange={(e) =>
                          updateItem(item.key, {
                            brandingMethod: e.target.value as BrandingMethod,
                          })
                        }
                      />
                    </div>
                    <TextAreaField
                      label="Item notes"
                      className="mt-3"
                      placeholder="Artwork placement, fabric preference, packing instructions"
                      value={item.notes}
                      onChange={(e) => updateItem(item.key, { notes: e.target.value })}
                    />
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between text-[13.5px]">
                <span className="text-charcoal">Total pieces</span>
                <span className="font-semibold tabular-nums text-navy">
                  {formatQuantity(totalPieces)}
                </span>
              </div>
            </>
          )}

        </div>
      </aside>
    </div>
  )
}
