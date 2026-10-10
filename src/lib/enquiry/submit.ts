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
 * Zoho's Web-to-Lead endpoint is designed for a normal HTML form navigation.
 * A `no-cors` fetch only returns an opaque response and can look successful
 * even when Zoho rejects the request. Posting a temporary form to a hidden
 * iframe preserves Zoho's supported browser flow. We only resolve after Zoho
 * redirects that iframe back to the configured same-origin return URL.
 */
async function submitToZoho(
  input: QuoteRequestInput,
  reference: string,
): Promise<void> {
  const frame = document.createElement('iframe')
  const frameName = `threadloom-zoho-${Date.now()}-${Math.random().toString(36).slice(2)}`
  frame.name = frameName
  frame.title = 'Zoho CRM enquiry delivery'
  frame.hidden = true
  frame.src = 'about:blank'

  const form = document.createElement('form')
  form.method = 'POST'
  form.action = ZOHO_WEBFORM_ENDPOINT
  form.target = frameName
  form.acceptCharset = 'UTF-8'
  form.hidden = true

  for (const [name, value] of buildZohoPayload(input, reference)) {
    const field = document.createElement('input')
    field.type = 'hidden'
    field.name = name
    field.value = value
    form.appendChild(field)
  }

  document.body.append(frame, form)

  try {
    await new Promise<void>((resolve, reject) => {
      let submitted = false
      const timer = window.setTimeout(
        () => reject(new Error('Zoho CRM did not confirm the enquiry in time')),
        TIMEOUT_MS,
      )

      const finish = () => {
        window.clearTimeout(timer)
        resolve()
      }

      frame.addEventListener('load', () => {
        if (!submitted) return

        // The first load can be Zoho's cross-origin processing page. The
        // successful second load is the configured Threadloom return URL.
        try {
          const href = frame.contentWindow?.location.href ?? ''
          if (href.startsWith(ZOHO_WEBFORM_RETURN_URL)) finish()
        } catch {
          // Still on Zoho's origin; wait for its redirect to Threadloom.
        }
      })

      submitted = true
      form.submit()
    })
  } finally {
    form.remove()
    frame.remove()
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
