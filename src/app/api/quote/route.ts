import { NextResponse } from 'next/server'

import { quoteRequestSchema, fieldErrors } from '@/lib/validation/schemas'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import {
  EmailNotConfiguredError,
  isEmailConfigured,
  redactEmailError,
  sendEnquiryEmail,
} from '@/lib/email'
import { createQuoteEnquiry, isZohoConfigured, redactForLog } from '@/lib/zoho'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** 5 enquiries per IP per 10 minutes. */
const LIMIT = 5
const WINDOW_MS = 10 * 60 * 1000
const MAX_BODY_BYTES = 32 * 1024

function reference(): string {
  const now = new Date()
  const stamp =
    String(now.getFullYear()).slice(2) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).slice(2, 7).toUpperCase()
  return 'QR-' + stamp + '-' + random
}

export async function POST(request: Request) {
  const ip = clientIp(request.headers)
  const limit = rateLimit('quote:' + ip, LIMIT, WINDOW_MS)
  if (!limit.ok) {
    return NextResponse.json(
      {
        ok: false,
        message:
          'Too many enquiries from this connection. Please try again shortly, or contact us directly.',
      },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    )
  }

  const length = Number(request.headers.get('content-length') ?? '0')
  if (length > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, message: 'That enquiry is too large to process.' },
      { status: 413 },
    )
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, message: 'We could not read that request.' },
      { status: 400 },
    )
  }

  const parsed = quoteRequestSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Please correct the highlighted fields.',
        errors: fieldErrors(parsed.error),
      },
      { status: 422 },
    )
  }

  const input = parsed.data

  // Honeypot filled in: accept silently so bots learn nothing.
  if (input.company_website) {
    return NextResponse.json({ ok: true, reference: reference() })
  }

  const ref = reference()

  /*
   * Delivery is mandatory.
   *
   * An earlier version returned success whenever the integrations were
   * unconfigured, which meant a customer saw "Enquiry received" while the
   * enquiry was discarded into a server log. Never again: if the enquiry
   * cannot be delivered to a human, the caller is told so plainly and given
   * the fallback contact route.
   */
  if (!isEmailConfigured()) {
    console.error(
      '[quote] REFUSED enquiry ' +
        ref +
        ': enquiry email is not configured. Set RESEND_API_KEY and ENQUIRY_TO_EMAIL.',
    )
    return NextResponse.json(
      {
        ok: false,
        code: 'delivery_unavailable',
        message:
          'Our enquiry system is not accepting messages right now. Please email or call us directly and we will pick it up straight away.',
      },
      { status: 503 },
    )
  }

  try {
    await sendEnquiryEmail(input, ref)
  } catch (error) {
    if (error instanceof EmailNotConfiguredError) {
      console.error('[quote] Enquiry ' + ref + ' not configured: ' + redactEmailError(error))
    } else {
      console.error('[quote] Enquiry ' + ref + ' delivery failed: ' + redactEmailError(error))
    }
    return NextResponse.json(
      {
        ok: false,
        code: 'delivery_failed',
        message:
          'We could not send your enquiry just now. Please email or call us directly — or try again in a few minutes.',
      },
      { status: 502 },
    )
  }

  /*
   * Zoho CRM is an optional extra. The enquiry is already safely in the sales
   * inbox at this point, so a CRM outage must not fail the request.
   */
  let crmSynced = false
  if (isZohoConfigured()) {
    try {
      await createQuoteEnquiry(input, new Date().toISOString())
      crmSynced = true
    } catch (error) {
      console.error('[quote] CRM sync for ' + ref + ' failed: ' + redactForLog(error))
    }
  }

  return NextResponse.json({ ok: true, reference: ref, crmSynced })
}
