import { NextResponse } from 'next/server'

import { getAuthenticatedUser, getProfile } from '@/lib/supabase/server'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import {
  isZohoConfigured,
  redactForLog,
  upsertContact,
  ZohoConfigError,
} from '@/lib/zoho'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** 10 syncs per IP per 5 minutes - the client only calls this once per session. */
const LIMIT = 10
const WINDOW_MS = 5 * 60 * 1000

/**
 * Pushes the signed-in customer into Zoho CRM.
 *
 * Identity comes exclusively from the Supabase session cookie and the
 * server-read profile row. Nothing in the request body is trusted, and the
 * password never exists outside Supabase Auth.
 *
 * The upsert is keyed on email, so repeat sign-ins update the same CRM record
 * instead of creating duplicates. A failure here never fails the sign-in.
 */
export async function POST(request: Request) {
  const ip = clientIp(request.headers)
  const limit = rateLimit('crm-sync:' + ip, LIMIT, WINDOW_MS)
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, status: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    )
  }

  const user = await getAuthenticatedUser()
  if (!user || !user.email) {
    return NextResponse.json({ ok: false, status: 'unauthenticated' }, { status: 401 })
  }

  if (!isZohoConfigured()) {
    // Not an error the visitor should see - the owner has simply not
    // configured the integration yet.
    console.warn('[crm-sync] Zoho CRM is not configured; skipping contact sync.')
    return NextResponse.json({ ok: true, status: 'skipped' })
  }

  const profile = await getProfile(user.id)
  if (!profile) {
    console.warn('[crm-sync] No profile row for the authenticated user; skipping.')
    return NextResponse.json({ ok: true, status: 'skipped' })
  }

  try {
    const result = await upsertContact({
      profile,
      // Always the session email, never a value supplied by the browser.
      email: user.email,
      signedInAt: new Date().toISOString(),
    })
    return NextResponse.json({ ok: true, status: result.action ?? 'synced' })
  } catch (error) {
    if (error instanceof ZohoConfigError) {
      console.error('[crm-sync] Configuration error: ' + redactForLog(error))
    } else {
      console.error('[crm-sync] Contact sync failed: ' + redactForLog(error))
    }

    // Neutral body: no upstream detail, no credentials, and a 200 so the
    // client-side sign-in flow is never disrupted. Safe to retry.
    return NextResponse.json({ ok: false, status: 'deferred' })
  }
}
