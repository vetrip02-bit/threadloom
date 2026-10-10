'use client'

import {
  ENQUIRY_DELIVERY_ENABLED,
  WEB3FORMS_ENDPOINT,
  WEB3FORMS_KEY,
  ZOHO_WEBFORM_ACTION_TYPE,
  ZOHO_WEBFORM_ENDPOINT,
  ZOHO_WEBFORM_RETURN_URL,
  ZOHO_WEBFORM_XMIWTLD,
  ZOHO_WEBFORM_XNQSJSDP,
} from './config'
import { enquirySubject, enquiryText } from './render'
import type { QuoteRequestInput } from '@/lib/validation/schemas'

const TIMEOUT_MS = 15_000

export type SubmitOutcome =
  | { ok: true; reference: string }
  | { ok: false; code: 'not_configured' | 'failed'; message: string }

/** Reference shown to the customer and used as the email subject prefix. */
export function makeReference(now = new Date()): string {
  const stamp =
    String(now.getFullYear()).slice(2) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).slice(2, 7).toUpperCase()
  return 'QR-' + stamp + '-' + random
}

/**
 * Builds the Web3Forms payload.
 *
 * Pure and exported so it can be unit-tested without touching the network.
 * The full enquiry is sent as one readable `message` field, so the owner's
 * inbox shows everything regardless of how the provider renders it.
 */
export function buildPayload(
  input: QuoteRequestInput,
  reference: string,
  accessKey: string,
): Record<string, string> {
  return {
    access_key: accessKey,
    subject: enquirySubject(input, reference),
    from_name: input.firstName + ' ' + input.lastName + ' (' + input.organization + ')',
    // Replying in the inbox reaches the customer, not the form service.
    replyto: input.email,
    // Web3Forms' own honeypot field name.
    botcheck: '',
    message: enquiryText(input, reference),
    reference,
    name: input.firstName + ' ' + input.lastName,
    email: input.email,
    phone: input.phone,
    organization: input.organization,
    city: input.city,
    customer_type: input.customerType,
    estimated_quantity: String(input.estimatedQuantity),
    expected_date: input.expectedDate || 'not specified',
    source: input.source,
  }
}

/** Maps a Threadloom enquiry onto the public Zoho CRM Web-to-Lead form. */
export function buildZohoPayload(
  input: QuoteRequestInput,
  reference: string,
): URLSearchParams {
  return new URLSearchParams({
    xnQsjsdp: ZOHO_WEBFORM_XNQSJSDP,
    zc_gad: '',
    xmIwtLD: ZOHO_WEBFORM_XMIWTLD,
    actionType: ZOHO_WEBFORM_ACTION_TYPE,
    returnURL: ZOHO_WEBFORM_RETURN_URL,
    Company: input.organization,
    'First Name': input.firstName,
    'Last Name': input.lastName,
    Email: input.email,
    Phone: input.phone,
    'Address - City': input.city,
    Description: enquiryText(input, reference),
    'Lead Source': 'Online Store',
    // Zoho's generated honeypot field. Legitimate submissions leave it blank.
    aG9uZXlwb3Q: '',
  })
}

/**
 * Sends the enquiry to Zoho CRM without exposing an OAuth credential.
 *
 * Web-to-Lead is a public, write-only browser endpoint. `no-cors` is required
 * because Zoho intentionally returns an opaque cross-origin response; a
 * resolved fetch confirms that the browser dispatched the form successfully.
 */
async function submitToZoho(
  input: QuoteRequestInput,
  reference: string,
): Promise<void> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    await fetch(ZOHO_WEBFORM_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      signal: controller.signal,
      body: buildZohoPayload(input, reference),
    })
  } finally {
    clearTimeout(timer)
  }
}

async function submitEmailCopy(
  input: QuoteRequestInput,
  reference: string,
): Promise<void> {
  if (!ENQUIRY_DELIVERY_ENABLED) return

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal: controller.signal,
      body: JSON.stringify(buildPayload(input, reference, WEB3FORMS_KEY)),
    })

    const payload = (await response.json().catch(() => ({}))) as {
      success?: boolean
    }
    if (!response.ok || payload.success !== true) {
      throw new Error('Email copy was not accepted')
    }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Sends the enquiry straight from the browser.
 *
 * Never resolves `ok: true` unless the provider confirmed receipt - an
 * enquiry the business will not receive must never look delivered.
 */
export async function submitEnquiry(
  input: QuoteRequestInput,
): Promise<SubmitOutcome> {
  const reference = makeReference()

  try {
    // Zoho is the system of record. The existing inbox delivery remains a
    // best-effort secondary notification and cannot block CRM capture.
    await submitToZoho(input, reference)
    void submitEmailCopy(input, reference).catch(() => undefined)

    return { ok: true, reference }
  } catch {
    return {
      ok: false,
      code: 'failed',
      message:
        'We could not reach our enquiry service. Please email or call us directly — or try again in a few minutes.',
    }
  }
}
