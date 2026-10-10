import type { CustomerType } from '@/types'

/**
 * Browser-backed account system.
 *
 * Used when no Supabase project is configured. It is a real sign-up / log-in
 * flow — an account is created, a password is verified, and a session keeps
 * the customer logged in — but everything lives in this browser:
 *
 *   - Passwords are never stored. Only a PBKDF2-SHA256 derivation (210,000
 *     iterations, per-account random salt) is kept, so reading localStorage
 *     does not reveal the password.
 *   - There is no server, so an account does not follow the customer to
 *     another device or browser, and nothing stops someone with access to
 *     this machine from clearing it.
 *
 * The UI states both limitations plainly. Configure Supabase and the real
 * backend takes over automatically — see AuthProvider.
 */

const ACCOUNTS_KEY = 'threadloom-accounts:v1'
const SESSION_KEY = 'threadloom-session:v1'
const ITERATIONS = 210_000

export interface LocalAccountProfile {
  firstName: string
  lastName: string
  organization: string
  phone: string
  city: string
  customerType: CustomerType | ''
}

export interface LocalAccount {
  email: string
  salt: string
  hash: string
  iterations: number
  profile: LocalAccountProfile
  createdAt: string
}

export interface LocalSession {
  email: string
  since: string
}

export type AuthFailure =
  | 'unsupported'
  | 'storage_blocked'
  | 'email_taken'
  | 'bad_credentials'

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** WebCrypto is required; without it we refuse rather than store a weak hash. */
export function isLocalAuthSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.crypto?.subtle?.deriveBits === 'function'
  )
}

export async function derivePasswordHash(
  password: string,
  saltHex: string,
  iterations: number = ITERATIONS,
): Promise<string> {
  const encoder = new TextEncoder()
  const salt = Uint8Array.from(
    saltHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
  )
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    256,
  )
  return toHex(new Uint8Array(bits))
}

/** Length-independent comparison, so timing does not leak the stored hash. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function readAccounts(): Record<string, LocalAccount> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as Record<string, LocalAccount>
  } catch {
    return {}
  }
}

function writeAccounts(accounts: Record<string, LocalAccount>): boolean {
  try {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
    return true
  } catch {
    return false
  }
}

export function readSession(): LocalSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LocalSession
    if (!parsed?.email) return null
    // A session whose account has been removed is not a session.
    if (!readAccounts()[parsed.email.toLowerCase()]) return null
    return parsed
  } catch {
    return null
  }
}

function writeSession(email: string): boolean {
  try {
    window.localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ email, since: new Date().toISOString() }),
    )
    return true
  } catch {
    return false
  }
}

export function getAccount(email: string): LocalAccount | null {
  return readAccounts()[email.trim().toLowerCase()] ?? null
}

export async function localSignUp(input: {
  email: string
  password: string
  profile: LocalAccountProfile
}): Promise<{ ok: true; account: LocalAccount } | { ok: false; reason: AuthFailure }> {
  if (!isLocalAuthSupported()) return { ok: false, reason: 'unsupported' }

  const email = input.email.trim().toLowerCase()
  const accounts = readAccounts()
  if (accounts[email]) return { ok: false, reason: 'email_taken' }

  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)))
  const hash = await derivePasswordHash(input.password, salt)

  const account: LocalAccount = {
    email,
    salt,
    hash,
    iterations: ITERATIONS,
    profile: input.profile,
    createdAt: new Date().toISOString(),
  }

  accounts[email] = account
  if (!writeAccounts(accounts)) return { ok: false, reason: 'storage_blocked' }
  if (!writeSession(email)) return { ok: false, reason: 'storage_blocked' }

  return { ok: true, account }
}

export async function localLogIn(
  email: string,
  password: string,
): Promise<{ ok: true; account: LocalAccount } | { ok: false; reason: AuthFailure }> {
  if (!isLocalAuthSupported()) return { ok: false, reason: 'unsupported' }

  const account = getAccount(email)
  if (!account) {
    // Derive anyway so a missing account takes about as long as a wrong
    // password, rather than revealing which addresses are registered.
    await derivePasswordHash(password, toHex(new Uint8Array(16)))
    return { ok: false, reason: 'bad_credentials' }
  }

  const hash = await derivePasswordHash(password, account.salt, account.iterations)
  if (!timingSafeEqual(hash, account.hash)) {
    return { ok: false, reason: 'bad_credentials' }
  }

  if (!writeSession(account.email)) return { ok: false, reason: 'storage_blocked' }
  return { ok: true, account }
}

export function localLogOut(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    // nothing to do
  }
}

/** The signed-in account, or null. */
export function currentLocalAccount(): LocalAccount | null {
  const session = readSession()
  if (!session) return null
  return getAccount(session.email)
}
