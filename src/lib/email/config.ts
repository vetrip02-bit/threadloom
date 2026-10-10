/**
 * Enquiry delivery configuration.
 *
 * This is the single most important setting in the application: without it,
 * a customer can fill in the quote form and nobody ever receives the enquiry.
 * The API route refuses to report success when this is not configured.
 */
export interface EmailConfig {
  apiKey: string
  /** Where enquiries are delivered. Your real sales inbox. */
  to: string
  /**
   * The From address. Must be on a domain verified in Resend, OR the shared
   * sandbox address `onboarding@resend.dev`, which only delivers to the
   * address that owns the Resend account.
   */
  from: string
}

export class EmailNotConfiguredError extends Error {
  readonly code = 'email_not_configured'
}

export function readEmailConfig(
  env: Record<string, string | undefined> = process.env,
): EmailConfig {
  const apiKey = env.RESEND_API_KEY?.trim() ?? ''
  const to = env.ENQUIRY_TO_EMAIL?.trim() ?? ''
  const from = env.ENQUIRY_FROM_EMAIL?.trim() || 'onboarding@resend.dev'

  const missing: string[] = []
  if (!apiKey) missing.push('RESEND_API_KEY')
  if (!to) missing.push('ENQUIRY_TO_EMAIL')
  if (missing.length > 0) {
    throw new EmailNotConfiguredError(
      'Enquiry email is not configured. Missing: ' + missing.join(', '),
    )
  }

  return { apiKey, to, from }
}

export function isEmailConfigured(
  env: Record<string, string | undefined> = process.env,
): boolean {
  try {
    readEmailConfig(env)
    return true
  } catch {
    return false
  }
}
