import type { Profile } from '@/types'
import type { CustomerType } from '@/types'

/** The contact fields a quote form shares with a saved profile. */
export interface ContactFields {
  firstName: string
  lastName: string
  organization: string
  email: string
  phone: string
  city: string
  customerType: CustomerType | ''
}

export const EMPTY_CONTACT: ContactFields = {
  firstName: '',
  lastName: '',
  organization: '',
  email: '',
  phone: '',
  city: '',
  customerType: '',
}

/**
 * Maps a saved profile onto the quote form's contact fields.
 *
 * `authEmail` wins over `profile.email`: the session address is the verified
 * one. Anything the customer has already typed is preserved, so prefill never
 * overwrites in-progress edits.
 */
export function prefillFromProfile(
  profile: Profile | null,
  authEmail: string | null | undefined,
  current: ContactFields = EMPTY_CONTACT,
): ContactFields {
  if (!profile && !authEmail) return current

  const pick = (typed: string, saved: string | null | undefined) =>
    typed.trim() !== '' ? typed : (saved ?? '').trim()

  return {
    firstName: pick(current.firstName, profile?.first_name),
    lastName: pick(current.lastName, profile?.last_name),
    organization: pick(current.organization, profile?.organization),
    email: pick(current.email, authEmail ?? profile?.email),
    phone: pick(current.phone, profile?.phone),
    city: pick(current.city, profile?.city),
    customerType:
      current.customerType !== ''
        ? current.customerType
        : ((profile?.customer_type ?? '') as CustomerType | ''),
  }
}

/** True when every contact field needed to submit is already populated. */
export function isContactComplete(contact: ContactFields): boolean {
  return (
    contact.firstName.trim() !== '' &&
    contact.lastName.trim() !== '' &&
    contact.organization.trim() !== '' &&
    contact.email.trim() !== '' &&
    contact.phone.trim() !== '' &&
    contact.city.trim() !== '' &&
    contact.customerType !== ''
  )
}
