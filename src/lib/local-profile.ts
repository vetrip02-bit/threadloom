import type { CustomerType } from '@/types'

/**
 * Device-local customer details.
 *
 * Used when no Supabase project is configured, so the site still lets a
 * returning customer avoid retyping everything. This is deliberately NOT an
 * account: there is no password, no server, and anyone using this browser
 * profile can see it. The UI labels it accordingly - calling it a login would
 * be a lie.
 *
 * The moment Supabase is configured, the real account system takes over and
 * these saved details are offered as a head start on the sign-up form.
 */
const KEY = 'threadloom-my-details:v1'

export interface LocalProfile {
  firstName: string
  lastName: string
  organization: string
  email: string
  phone: string
  city: string
  customerType: CustomerType | ''
  savedAt: string
}

export const EMPTY_LOCAL_PROFILE: LocalProfile = {
  firstName: '',
  lastName: '',
  organization: '',
  email: '',
  phone: '',
  city: '',
  customerType: '',
  savedAt: '',
}

function isProfileShaped(value: unknown): value is LocalProfile {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return typeof v.firstName === 'string' && typeof v.email === 'string'
}

export function readLocalProfile(): LocalProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isProfileShaped(parsed)) return null
    return { ...EMPTY_LOCAL_PROFILE, ...parsed }
  } catch {
    // Private mode, disabled storage, or corrupt JSON: behave as if empty.
    return null
  }
}

export function writeLocalProfile(profile: Omit<LocalProfile, 'savedAt'>): boolean {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ ...profile, savedAt: new Date().toISOString() }),
    )
    return true
  } catch {
    return false
  }
}

export function clearLocalProfile(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    // nothing to do
  }
}

/** True when every field the quote form needs is filled in. */
export function isLocalProfileComplete(profile: LocalProfile | null): boolean {
  if (!profile) return false
  return (
    profile.firstName.trim() !== '' &&
    profile.lastName.trim() !== '' &&
    profile.organization.trim() !== '' &&
    profile.email.trim() !== '' &&
    profile.phone.trim() !== '' &&
    profile.city.trim() !== '' &&
    profile.customerType !== ''
  )
}
