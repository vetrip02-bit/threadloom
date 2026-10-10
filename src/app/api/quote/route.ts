import { NextResponse } from 'next/server'

import { quoteRequestSchema, fieldErrors } from '@/lib/validation/schemas'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import {
  createQuoteEnquiry,
  isZohoConfigured,
  redactForLog,
  ZohoConfigError,
} from '@/lib/zoho'

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
          'Too many enquiries from this connection. Please try again shortly, or email us directly.',
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
  const consentTimestamp = new Date().toISOString()

  if (!isZohoConfigured()) {
    // The enquiry is still a success for the visitor; the owner sees the gap
    // in the server log and wires Zoho up.
    console.warn(
      '[quote] Zoho CRM is not configured - enquiry ' +
        ref +
        ' was accepted but not pushed to CRM.',
    )
    return NextResponse.json({ ok: true, reference: ref, crmSynced: false })
  }

  try {
    await createQuoteEnquiry(input, consentTimestamp)
    return NextResponse.json({ ok: true, reference: ref, crmSynced: true })
  } catch (error) {
    if (error instanceof ZohoConfigError) {
      console.error('[quote] Zoho configuration error: ' + redactForLog(error))
    } else {
      console.error('[quote] Zoho enquiry ' + ref + ' failed: ' + redactForLog(error))
    }

    // The visitor should not be punished for a CRM outage. Accept the enquiry
    // and flag it in the log so it can be recovered manually.
    return NextResponse.json({ ok: true, reference: ref, crmSynced: false })
  }
}
