import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  EmailNotConfiguredError,
  isEmailConfigured,
  readEmailConfig,
} from '@/lib/email/config'
import {
  enquiryHtml,
  enquirySubject,
  enquiryText,
  escapeHtml,
} from '@/lib/email/render'
import type { QuoteRequestInput } from '@/lib/validation/schemas'

const enquiry: QuoteRequestInput = {
  firstName: 'Asha',
  lastName: 'Menon',
  organization: 'Lakeside Public School',
  email: 'asha.menon@example.com',
  phone: '+919876543210',
  city: 'Kochi',
  customerType: 'School / College',
  requirements: 'Summer uniform sets for 420 students across classes 1 to 10.',
  estimatedQuantity: 420,
  expectedDate: '2026-04-15',
  consent: true,
  source: 'quote',
  items: [
    {
      productId: 'school-shirt',
      productName: 'Classic Uniform Shirt',
      category: 'school-college-uniforms',
      quantity: 420,
      color: 'White',
      sizes: '120 x 28, 180 x 30',
      brandingMethod: 'Embroidery',
      notes: 'Crest on left chest',
    },
  ],
}

describe('email configuration', () => {
  it('is not configured when the API key or destination is missing', () => {
    expect(isEmailConfigured({})).toBe(false)
    expect(isEmailConfigured({ RESEND_API_KEY: 're_test' })).toBe(false)
    expect(isEmailConfigured({ ENQUIRY_TO_EMAIL: 'sales@example.com' })).toBe(false)
  })

  it('names every missing variable so the owner knows what to set', () => {
    try {
      readEmailConfig({})
      throw new Error('should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(EmailNotConfiguredError)
      expect((error as Error).message).toContain('RESEND_API_KEY')
      expect((error as Error).message).toContain('ENQUIRY_TO_EMAIL')
    }
  })

  it('falls back to the Resend sandbox sender when none is given', () => {
    const config = readEmailConfig({
      RESEND_API_KEY: 're_test',
      ENQUIRY_TO_EMAIL: 'sales@example.com',
    })
    expect(config.from).toBe('onboarding@resend.dev')
    expect(config.to).toBe('sales@example.com')
  })
})

describe('enquiry rendering', () => {
  it('puts the reference, source and organization in the subject', () => {
    const subject = enquirySubject(enquiry, 'QR-260101-ABCDE')
    expect(subject).toContain('QR-260101-ABCDE')
    expect(subject).toContain('Quote builder')
    expect(subject).toContain('Lakeside Public School')
    expect(subject).toContain('420 pcs')
  })

  it('includes every contact field in the plain-text body', () => {
    const text = enquiryText(enquiry, 'QR-260101-ABCDE')
    for (const expected of [
      'Asha Menon',
      'Lakeside Public School',
      'asha.menon@example.com',
      '+919876543210',
      'Kochi',
      '420 pcs',
      '2026-04-15',
    ]) {
      expect(text).toContain(expected)
    }
  })

  it('lists the quote items with their variants', () => {
    const text = enquiryText(enquiry, 'QR-260101-ABCDE')
    expect(text).toContain('Classic Uniform Shirt')
    expect(text).toContain('Quantity: 420')
    expect(text).toContain('Colour:   White')
    expect(text).toContain('Branding: Embroidery')
    expect(text).toContain('Crest on left chest')
  })

  it('says so explicitly when no catalogue items were chosen', () => {
    const text = enquiryText({ ...enquiry, items: [] }, 'QR-1')
    expect(text).toContain('none selected')
  })

  it('escapes HTML so a hostile enquiry cannot inject markup', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;',
    )
    const html = enquiryHtml(
      { ...enquiry, organization: '<img src=x onerror=alert(1)>' },
      'QR-1',
    )
    expect(html).not.toContain('<img src=x')
    expect(html).toContain('&lt;img src=x')
  })

  it('never puts the API key into a rendered body', () => {
    const body = enquiryHtml(enquiry, 'QR-1') + enquiryText(enquiry, 'QR-1')
    expect(body).not.toContain('re_')
    expect(body.toLowerCase()).not.toContain('api')
  })
})

describe('sendEnquiryEmail', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  const config = {
    apiKey: 're_test_key',
    to: 'sales@example.com',
    from: 'onboarding@resend.dev',
  }

  it('posts the enquiry and returns the message id', async () => {
    const fetchMock = vi.fn(
      async (_url: string | URL | Request, _init?: RequestInit) =>
        new Response(JSON.stringify({ id: 'msg_123' }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { sendEnquiryEmail } = await import('@/lib/email/send')
    const result = await sendEnquiryEmail(enquiry, 'QR-1', config)

    expect(result.id).toBe('msg_123')
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.resend.com/emails')
    const body = JSON.parse(init!.body as string)
    expect(body.to).toEqual(['sales@example.com'])
    // Replying in the inbox must reach the customer, not the sender identity.
    expect(body.reply_to).toBe('asha.menon@example.com')
    expect(body.text).toContain('Lakeside Public School')
  })

  it('throws when the provider rejects the message, so the route cannot fake success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ name: 'validation_error' }), { status: 422 }),
      ),
    )
    const { sendEnquiryEmail, EmailSendError } = await import('@/lib/email/send')
    await expect(sendEnquiryEmail(enquiry, 'QR-1', config)).rejects.toBeInstanceOf(
      EmailSendError,
    )
  })

  it('throws when the provider returns 200 but no message id', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({}), { status: 200 })),
    )
    const { sendEnquiryEmail } = await import('@/lib/email/send')
    await expect(sendEnquiryEmail(enquiry, 'QR-1', config)).rejects.toThrow()
  })

  it('redacts the API key before anything is logged', async () => {
    const { redactEmailError } = await import('@/lib/email/send')
    const message = redactEmailError(
      new Error('request failed with key re_abc123XYZ_secret'),
    )
    expect(message).not.toContain('re_abc123XYZ_secret')
    expect(message).toContain('[redacted-resend-key]')
  })
})
