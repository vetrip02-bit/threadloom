import 'server-only'

import { readEmailConfig, type EmailConfig } from './config'
import { enquiryHtml, enquirySubject, enquiryText } from './render'
import type { QuoteRequestInput } from '@/lib/validation/schemas'

/**
 * Server-only enquiry delivery over the Resend REST API.
 *
 * No SDK: a single fetch keeps the dependency list minimal, which the project
 * brief asked for. Errors are thrown so the caller can refuse to report
 * success - an enquiry the business never receives must never look delivered.
 */

const TIMEOUT_MS = 10_000

export class EmailSendError extends Error {
  readonly code = 'email_send_failed'
  constructor(
    message: string,
    readonly status: number,
    /** Server-side only. Never serialise this to a response. */
    readonly upstream?: unknown,
  ) {
    super(message)
  }
}

export interface SendResult {
  id: string
}

export async function sendEnquiryEmail(
  input: QuoteRequestInput,
  reference: string,
  config: EmailConfig = readEmailConfig(),
): Promise<SendResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + config.apiKey,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store',
      body: JSON.stringify({
        from: config.from,
        to: [config.to],
        // Hitting reply in the inbox answers the customer directly.
        reply_to: input.email,
        subject: enquirySubject(input, reference),
        text: enquiryText(input, reference),
        html: enquiryHtml(input, reference),
      }),
    })

    const payload = (await response.json().catch(() => ({}))) as {
      id?: string
      message?: string
      name?: string
    }

    if (!response.ok || !payload.id) {
      throw new EmailSendError(
        'Resend rejected the enquiry email: ' +
          (payload.name ?? payload.message ?? response.status),
        response.status,
        payload,
      )
    }

    return { id: payload.id }
  } catch (error) {
    if (error instanceof EmailSendError) throw error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new EmailSendError('Enquiry email timed out.', 504)
    }
    throw new EmailSendError(
      'Enquiry email failed: ' + (error instanceof Error ? error.message : 'unknown'),
      500,
    )
  } finally {
    clearTimeout(timer)
  }
}

/** Strips anything secret-shaped before a message reaches the server log. */
export function redactEmailError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error)
  return raw.replace(/re_[A-Za-z0-9_-]+/g, '[redacted-resend-key]').slice(0, 500)
}
