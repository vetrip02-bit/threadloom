import 'server-only'

import { buildQuoteRecord, type ZohoRecord } from './mapping'
import type { QuoteRequestInput } from '@/lib/validation/schemas'

/**
 * Server-only Zoho CRM v8 client.
 *
 * Nothing in this file may be imported from a client component: the
 * `server-only` import above turns that into a build error. No credential is
 * ever returned to the caller, and upstream error bodies are logged but never
 * forwarded to the browser.
 */

const TIMEOUT_MS = 10_000
const TOKEN_SAFETY_WINDOW_MS = 60_000

export interface ZohoConfig {
  clientId: string
  clientSecret: string
  refreshToken: string
  accountsUrl: string
  apiDomain: string
  quoteModule: string
}

export class ZohoConfigError extends Error {
  readonly code = 'zoho_not_configured'
}

export class ZohoApiError extends Error {
  readonly code = 'zoho_api_error'
  constructor(
    message: string,
    readonly status: number,
    /** Kept server-side only. Never serialise this to a response. */
    readonly upstream?: unknown,
  ) {
    super(message)
  }
}

/** Reads and validates the server environment. Throws ZohoConfigError if unset. */
export function readZohoConfig(env: Record<string, string | undefined> = process.env): ZohoConfig {
  const missing: string[] = []
  const required = (name: string) => {
    const value = env[name]
    if (!value) missing.push(name)
    return value ?? ''
  }

  const config: ZohoConfig = {
    clientId: required('ZOHO_CLIENT_ID'),
    clientSecret: required('ZOHO_CLIENT_SECRET'),
    refreshToken: required('ZOHO_REFRESH_TOKEN'),
    accountsUrl: (env.ZOHO_ACCOUNTS_URL || '').replace(/\/$/, ''),
    apiDomain: (env.ZOHO_API_DOMAIN || '').replace(/\/$/, ''),
    quoteModule: env.ZOHO_QUOTE_MODULE || 'Leads',
  }

  if (!config.accountsUrl) missing.push('ZOHO_ACCOUNTS_URL')
  if (missing.length > 0) {
    throw new ZohoConfigError('Missing Zoho environment variables: ' + missing.join(', '))
  }
  return config
}

export function isZohoConfigured(env: Record<string, string | undefined> = process.env): boolean {
  try {
    readZohoConfig(env)
    return true
  } catch {
    return false
  }
}

interface CachedToken {
  accessToken: string
  apiDomain: string
  expiresAt: number
}

/**
 * Module-scoped token cache. Zoho rate-limits refresh calls, so reuse the
 * access token until a minute before it expires.
 */
let tokenCache: CachedToken | null = null

/** Test seam. */
export function __clearTokenCache() {
  tokenCache = null
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal, cache: 'no-store' })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Exchanges the long-lived refresh token for an access token.
 * Returns the `api_domain` Zoho reports so the data centre is never hard-coded.
 */
export async function refreshAccessToken(
  config: ZohoConfig = readZohoConfig(),
  options: { force?: boolean } = {},
): Promise<{ accessToken: string; apiDomain: string }> {
  if (!options.force && tokenCache && tokenCache.expiresAt > Date.now()) {
    return { accessToken: tokenCache.accessToken, apiDomain: tokenCache.apiDomain }
  }

  const body = new URLSearchParams({
    refresh_token: config.refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'refresh_token',
  })

  const response = await fetchWithTimeout(config.accountsUrl + '/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  const payload = (await response.json().catch(() => ({}))) as {
    access_token?: string
    api_domain?: string
    expires_in?: number
    error?: string
  }

  if (!response.ok || !payload.access_token) {
    throw new ZohoApiError(
      'Zoho token refresh failed: ' + (payload.error ?? response.status),
      response.status,
      payload,
    )
  }

  // Prefer the domain Zoho hands back; fall back to the configured one.
  const apiDomain = (payload.api_domain || config.apiDomain).replace(/\/$/, '')
  if (!apiDomain) {
    throw new ZohoApiError('Zoho did not return an api_domain and none is configured.', 500)
  }

  const expiresInMs = (payload.expires_in ?? 3600) * 1000
  tokenCache = {
    accessToken: payload.access_token,
    apiDomain,
    expiresAt: Date.now() + Math.max(0, expiresInMs - TOKEN_SAFETY_WINDOW_MS),
  }

  return { accessToken: payload.access_token, apiDomain }
}

interface CrmWriteResult {
  ok: boolean
  /** Zoho record id, when the write succeeded. */
  id?: string
  /** 'insert' | 'update' as reported by Zoho's upsert response. */
  action?: string
}

async function crmWrite(
  module: string,
  payload: { data: ZohoRecord[]; duplicate_check_fields?: string[] },
  method: 'POST' | 'PUT',
  config: ZohoConfig,
  attempt = 0,
): Promise<CrmWriteResult> {
  const { accessToken, apiDomain } = await refreshAccessToken(config, {
    force: attempt > 0,
  })

  const url =
    apiDomain +
    '/crm/v8/' +
    encodeURIComponent(module) +
    (method === 'POST' && payload.duplicate_check_fields ? '/upsert' : '')

  const response = await fetchWithTimeout(url, {
    method,
    headers: {
      Authorization: 'Zoho-oauthtoken ' + accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  // An expired/invalid token is retried exactly once with a forced refresh.
  if (response.status === 401 && attempt === 0) {
    __clearTokenCache()
    return crmWrite(module, payload, method, config, attempt + 1)
  }

  const json = (await response.json().catch(() => ({}))) as {
    data?: Array<{ code?: string; status?: string; details?: { id?: string }; action?: string }>
    message?: string
  }

  if (process.env.ZOHO_DEBUG === '1') {
    console.info('[zoho] ' + method + ' ' + module + ' -> ' + response.status, {
      code: json.data?.[0]?.code,
      status: json.data?.[0]?.status,
    })
  }

  if (!response.ok) {
    throw new ZohoApiError(
      'Zoho ' + module + ' write failed with status ' + response.status,
      response.status,
      json,
    )
  }

  const first = json.data?.[0]
  if (first?.status && first.status !== 'success') {
    throw new ZohoApiError(
      'Zoho rejected the ' + module + ' record: ' + (first.code ?? 'unknown'),
      422,
      json,
    )
  }

  return { ok: true, id: first?.details?.id, action: first?.action }
}

/**
 * Creates a quote-enquiry record in the configured module (Leads by default).
 * Enquiries are deliberately NOT de-duplicated - each one is a distinct event.
 */
export async function createQuoteEnquiry(
  input: QuoteRequestInput,
  consentTimestamp: string,
  config: ZohoConfig = readZohoConfig(),
): Promise<CrmWriteResult> {
  const record = buildQuoteRecord(input, consentTimestamp)
  return crmWrite(config.quoteModule, { data: [record] }, 'POST', config)
}

/** Redacts anything that looks like a secret before it reaches the server log. */
export function redactForLog(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error)
  return raw
    .replace(/1000\.[A-Za-z0-9._-]+/g, '[redacted-zoho-token]')
    .replace(/(client_secret|refresh_token|access_token)=[^&\s]+/gi, '$1=[redacted]')
    .slice(0, 500)
}
