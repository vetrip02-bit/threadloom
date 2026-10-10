/**
 * Only same-site relative paths are ever used as a post-login destination.
 *
 * Without this check, `?next=https://evil.example` would turn the sign-in page
 * into an open redirect that phishers can point at your domain.
 */
export function safeRedirect(value: string | null | undefined, fallback = '/'): string {
  if (!value) return fallback
  const candidate = value.trim()

  // Must be root-relative, and must not be protocol-relative ("//evil.com")
  // or contain a scheme or a backslash (which some browsers normalise to "/").
  if (!candidate.startsWith('/')) return fallback
  if (candidate.startsWith('//')) return fallback
  if (candidate.includes('\\')) return fallback
  if (/^\/[a-z][a-z0-9+.-]*:/i.test(candidate)) return fallback

  // Never bounce the user straight back into an auth page.
  if (/^\/(signin|signup)(\/|\?|#|$)/.test(candidate)) return fallback

  return candidate
}
