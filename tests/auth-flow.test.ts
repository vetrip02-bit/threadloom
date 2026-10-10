import { describe, expect, it } from 'vitest'

import { safeRedirect } from '@/lib/safe-redirect'
import {
  EMPTY_CONTACT,
  isContactComplete,
  prefillFromLocalAccount,
  prefillFromProfile,
  type ContactFields,
} from '@/lib/profile-prefill'
import { signUpSchema, fieldErrors } from '@/lib/validation/schemas'
import type { Profile } from '@/types'

const profile: Profile = {
  id: '6f1a1d2e-0000-4000-8000-9f0b1c2d3e4f',
  first_name: 'Asha',
  last_name: 'Menon',
  email: 'old-address@example.com',
  phone: '+919876543210',
  organization: 'Lakeside Public School',
  customer_type: 'School / College',
  city: 'Kochi',
  consent_at: '2026-01-10T06:30:00.000Z',
  created_at: '2026-01-10T06:30:00.000Z',
  updated_at: '2026-01-10T06:30:00.000Z',
}

describe('safeRedirect', () => {
  it('keeps a normal same-site path', () => {
    expect(safeRedirect('/uniforms/custom-tshirts')).toBe('/uniforms/custom-tshirts')
    expect(safeRedirect('/quote')).toBe('/quote')
  })

  it('refuses an absolute URL, so the login page is not an open redirect', () => {
    expect(safeRedirect('https://evil.example/phish')).toBe('/')
    expect(safeRedirect('http://evil.example')).toBe('/')
  })

  it('refuses a protocol-relative URL', () => {
    expect(safeRedirect('//evil.example/phish')).toBe('/')
  })

  it('refuses backslash and scheme tricks', () => {
    expect(safeRedirect('/\\evil.example')).toBe('/')
    expect(safeRedirect('/javascript:alert(1)')).toBe('/')
  })

  it('refuses to bounce back into an auth page', () => {
    expect(safeRedirect('/signin')).toBe('/')
    expect(safeRedirect('/signup?next=/signup')).toBe('/')
  })

  it('falls back when empty or missing', () => {
    expect(safeRedirect(null)).toBe('/')
    expect(safeRedirect(undefined)).toBe('/')
    expect(safeRedirect('')).toBe('/')
    expect(safeRedirect('', '/quote')).toBe('/quote')
  })
})

describe('prefillFromProfile', () => {
  it('fills every contact field from a saved profile', () => {
    const result = prefillFromProfile(profile, 'asha@example.com')
    expect(result.firstName).toBe('Asha')
    expect(result.lastName).toBe('Menon')
    expect(result.organization).toBe('Lakeside Public School')
    expect(result.phone).toBe('+919876543210')
    expect(result.city).toBe('Kochi')
    expect(result.customerType).toBe('School / College')
  })

  it('prefers the authenticated email over the stored one', () => {
    const result = prefillFromProfile(profile, 'verified@example.com')
    expect(result.email).toBe('verified@example.com')
  })

  it('falls back to the profile email when there is no session email', () => {
    const result = prefillFromProfile(profile, null)
    expect(result.email).toBe('old-address@example.com')
  })

  it('never overwrites something the customer has already typed', () => {
    const typed: ContactFields = {
      ...EMPTY_CONTACT,
      firstName: 'Ravi',
      city: 'Chennai',
    }
    const result = prefillFromProfile(profile, 'asha@example.com', typed)
    expect(result.firstName).toBe('Ravi')
    expect(result.city).toBe('Chennai')
    // Untouched fields still fill in.
    expect(result.lastName).toBe('Menon')
  })

  it('leaves the form untouched for a guest', () => {
    expect(prefillFromProfile(null, null)).toEqual(EMPTY_CONTACT)
  })

  it('handles a signed-in user whose profile row has not loaded yet', () => {
    const result = prefillFromProfile(null, 'asha@example.com')
    expect(result.email).toBe('asha@example.com')
    expect(result.firstName).toBe('')
  })

  it('tolerates null columns without producing "null" strings', () => {
    const sparse: Profile = {
      ...profile,
      phone: null,
      organization: null,
      city: null,
      customer_type: null,
    }
    const result = prefillFromProfile(sparse, 'asha@example.com')
    expect(result.phone).toBe('')
    expect(result.organization).toBe('')
    expect(result.customerType).toBe('')
  })
})

describe('isContactComplete', () => {
  it('is true only when every field needed to submit is present', () => {
    const complete = prefillFromProfile(profile, 'asha@example.com')
    expect(isContactComplete(complete)).toBe(true)
  })

  it('is false when the profile is missing anything', () => {
    const incomplete = prefillFromProfile(
      { ...profile, city: null },
      'asha@example.com',
    )
    // An incomplete profile must fall back to the full editable fieldset,
    // otherwise the customer could never supply the missing value.
    expect(isContactComplete(incomplete)).toBe(false)
  })

  it('is false for a guest', () => {
    expect(isContactComplete(EMPTY_CONTACT)).toBe(false)
  })

  it('is false when only whitespace was entered', () => {
    expect(
      isContactComplete({ ...EMPTY_CONTACT, firstName: '   ' }),
    ).toBe(false)
  })
})

describe('signUpSchema', () => {
  const valid = {
    firstName: 'Ravi',
    lastName: 'Iyer',
    email: 'ravi@example.com',
    phone: '9876543210',
    organization: 'Northline Hospitality',
    customerType: 'Hospitality' as const,
    city: 'Pune',
    password: 'Uniforms2026',
    consent: true as const,
  }

  it('accepts a complete registration', () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true)
  })

  it('enforces password length and composition', () => {
    expect(signUpSchema.safeParse({ ...valid, password: 'Short1' }).success).toBe(false)
    expect(signUpSchema.safeParse({ ...valid, password: 'alllowercase1' }).success).toBe(false)
    expect(signUpSchema.safeParse({ ...valid, password: 'NoDigitsHere' }).success).toBe(false)
  })

  it('requires the privacy consent checkbox', () => {
    expect(signUpSchema.safeParse({ ...valid, consent: false }).success).toBe(false)
  })

  it('never leaks the password through a validation error', () => {
    const result = signUpSchema.safeParse({ ...valid, password: 'hunter2' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(JSON.stringify(fieldErrors(result.error))).not.toContain('hunter2')
    }
  })
})

describe('prefillFromLocalAccount', () => {
  const account = {
    email: 'ravi@example.com',
    salt: 'aa',
    hash: 'bb',
    iterations: 210000,
    createdAt: '2026-02-01T09:00:00.000Z',
    profile: {
      firstName: 'Ravi',
      lastName: 'Kumar',
      organization: 'Northline Hospitality',
      phone: '+919876543210',
      city: 'Pune',
      customerType: 'Hospitality' as const,
    },
  }

  it('fills every contact field from the account', () => {
    const result = prefillFromLocalAccount(account)
    expect(result.firstName).toBe('Ravi')
    expect(result.organization).toBe('Northline Hospitality')
    expect(result.email).toBe('ravi@example.com')
    expect(result.customerType).toBe('Hospitality')
  })

  it('never overwrites something already typed', () => {
    const result = prefillFromLocalAccount(account, { ...EMPTY_CONTACT, city: 'Chennai' })
    expect(result.city).toBe('Chennai')
    expect(result.firstName).toBe('Ravi')
  })

  it('leaves the form untouched when logged out', () => {
    expect(prefillFromLocalAccount(null)).toEqual(EMPTY_CONTACT)
  })

  it('produces a complete contact, so the quote form collapses it', () => {
    expect(isContactComplete(prefillFromLocalAccount(account))).toBe(true)
  })

  it('stays incomplete when the account is missing a field', () => {
    const partial = prefillFromLocalAccount({
      ...account,
      profile: { ...account.profile, city: '' },
    })
    expect(isContactComplete(partial)).toBe(false)
  })

  it('never exposes the password hash or salt in the contact fields', () => {
    const serialised = JSON.stringify(prefillFromLocalAccount(account))
    expect(serialised).not.toContain(account.hash)
    expect(serialised).not.toContain(account.salt)
  })
})
