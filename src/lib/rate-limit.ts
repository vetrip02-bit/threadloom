/**
 * Minimal in-memory fixed-window rate limiter.
 *
 * This is per-instance only: it protects a single server process against a
 * burst from one IP. On a multi-instance or serverless deployment, swap the
 * `hits` map for a shared store (Upstash Redis, Vercel KV, Supabase) - only
 * this file has to change.
 */
type Entry = { count: number; resetAt: number }

const hits = new Map<string, Entry>()
const MAX_KEYS = 10000

export interface RateLimitResult {
  ok: boolean
  remaining: number
  /** Seconds until the current window resets. */
  retryAfter: number
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || entry.resetAt <= now) {
    if (hits.size > MAX_KEYS) sweep(now)
    hits.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfter: Math.ceil(windowMs / 1000) }
  }

  entry.count += 1
  const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000))
  if (entry.count > limit) {
    return { ok: false, remaining: 0, retryAfter }
  }
  return { ok: true, remaining: limit - entry.count, retryAfter }
}

function sweep(now: number) {
  for (const [key, entry] of hits) {
    if (entry.resetAt <= now) hits.delete(key)
  }
}

/** Best-effort client IP from the usual proxy headers. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return headers.get('x-real-ip') ?? headers.get('cf-connecting-ip') ?? 'unknown'
}

/** Test seam - clears all counters. */
export function __resetRateLimit() {
  hits.clear()
}
