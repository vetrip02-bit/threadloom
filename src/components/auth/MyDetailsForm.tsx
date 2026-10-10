'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Info, Trash2 } from 'lucide-react'

import { useAuth } from '@/components/auth/AuthProvider'
import { CUSTOMER_TYPES } from '@/data/catalog'
import { SelectField, TextField } from '@/components/ui/Field'
import { Button, ButtonLink } from '@/components/ui/Button'
import {
  EMPTY_LOCAL_PROFILE,
  writeLocalProfile,
  type LocalProfile,
} from '@/lib/local-profile'
import { emailSchema, phoneSchema } from '@/lib/validation/schemas'
import type { CustomerType } from '@/types'

/**
 * Device-local details form.
 *
 * Shown instead of sign-up when no Supabase project is configured. Everything
 * here stays in this browser - the copy says so plainly rather than implying
 * an account exists.
 */
export function MyDetailsForm() {
  const router = useRouter()
  const { localProfile, refreshLocalProfile, forgetLocalProfile } = useAuth()
  const [values, setValues] = useState<Omit<LocalProfile, 'savedAt'>>(EMPTY_LOCAL_PROFILE)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [storageFailed, setStorageFailed] = useState(false)

  useEffect(() => {
    if (localProfile) {
      // `savedAt` is metadata, not a form field.
      const rest = { ...localProfile } as Partial<LocalProfile>
      delete rest.savedAt
      setValues({ ...EMPTY_LOCAL_PROFILE, ...rest })
    }
  }, [localProfile])

  function set<K extends keyof Omit<LocalProfile, 'savedAt'>>(
    key: K,
    value: Omit<LocalProfile, 'savedAt'>[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key as string]
      return next
    })
    setSaved(false)
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!values.firstName.trim()) next.firstName = 'First name is required.'
    if (!values.lastName.trim()) next.lastName = 'Last name is required.'
    if (!values.organization.trim()) next.organization = 'Organization is required.'
    if (!values.city.trim()) next.city = 'City is required.'
    if (!values.customerType) next.customerType = 'Select a customer type.'

    const email = emailSchema.safeParse(values.email)
    if (!email.success) next.email = email.error.issues[0]!.message

    const phone = phoneSchema.safeParse(values.phone)
    if (!phone.success) next.phone = phone.error.issues[0]!.message

    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return

    const ok = writeLocalProfile(values)
    if (!ok) {
      // Private browsing or blocked storage: say so instead of pretending.
      setStorageFailed(true)
      return
    }
    setStorageFailed(false)
    refreshLocalProfile()
    setSaved(true)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="flex items-start gap-3 rounded-[8px] border border-hairline bg-ivory p-4">
        <Info size={17} strokeWidth={1.7} className="mt-0.5 shrink-0 text-navy" aria-hidden="true" />
        <p className="text-[13px] leading-6 text-charcoal">
          These details are saved <strong className="text-navy">in this browser only</strong>.
          There is no password and no account — anyone using this device can see
          them, and they will not follow you to another phone or computer. They
          exist so you do not have to retype everything on each quote.
        </p>
      </div>

      {storageFailed ? (
        <div role="alert" className="rounded-[8px] border border-burgundy/35 bg-burgundy/5 p-4">
          <p className="text-[13.5px] leading-6 text-navy">
            Your browser is blocking local storage, so your details could not be
            saved. Private-browsing windows usually do this. You can still request
            a quote — you will just need to type your details each time.
          </p>
        </div>
      ) : null}

      {saved ? (
        <div role="status" className="flex items-start gap-3 rounded-[8px] border border-hairline bg-white p-4">
          <CheckCircle2
            size={18}
            strokeWidth={1.8}
            className="mt-0.5 shrink-0 text-burgundy"
            aria-hidden="true"
          />
          <p className="text-[13.5px] leading-6 text-navy">
            Saved. Your quote requests will be filled in automatically from now on.
          </p>
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
        <SelectField
          label="Customer type"
          required
          placeholder="Select the closest match"
          options={CUSTOMER_TYPES}
          value={values.customerType}
          error={errors.customerType}
          onChange={(e) => set('customerType', e.target.value as CustomerType)}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center">
        <Button type="submit">Save my details</Button>
        <ButtonLink href="/quote" variant="ghost">
          Go to quote request
        </ButtonLink>
        {localProfile ? (
          <button
            type="button"
            onClick={() => {
              forgetLocalProfile()
              setValues(EMPTY_LOCAL_PROFILE)
              setSaved(false)
              router.refresh()
            }}
            className="inline-flex items-center gap-1.5 text-[13px] text-charcoal underline-offset-4 transition-colors hover:text-burgundy hover:underline sm:ml-auto"
          >
            <Trash2 size={14} strokeWidth={1.7} aria-hidden="true" />
            Forget my details
          </button>
        ) : null}
      </div>
    </form>
  )
}
