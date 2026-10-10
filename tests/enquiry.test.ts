import { describe, expect, it } from 'vitest'

import { buildPayload, makeReference } from '@/lib/enquiry/submit'
import {
  enquiryHtml,
  enquirySubject,
  enquiryText,
  escapeHtml,
} from '@/lib/enquiry/render'
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

describe('makeReference', () => {
  it('encodes the date and is unique per call', () => {
    const ref = makeReference(new Date('2026-04-15T09:00:00Z'))
    expect(ref).toMatch(/^QR-260415-[A-Z0-9]{5}$/)
    expect(makeReference()).not.toBe(makeReference())
  })
})

describe('buildPayload', () => {
  const payload = buildPayload(enquiry, 'QR-260415-ABCDE', 'test-access-key')

  it('carries the access key and the destination subject', () => {
    expect(payload.access_key).toBe('test-access-key')
    expect(payload.subject).toContain('QR-260415-ABCDE')
    expect(payload.subject).toContain('Lakeside Public School')
  })

  it('sets reply-to to the customer so replying reaches them', () => {
    expect(payload.replyto).toBe('asha.menon@example.com')
  })

  it('includes the whole enquiry in the message body', () => {
    expect(payload.message).toContain('Classic Uniform Shirt')
    expect(payload.message).toContain('Kochi')
    expect(payload.message).toContain('420 pcs')
  })

  it('sends every field as a string, as the form endpoint expects', () => {
    for (const [key, value] of Object.entries(payload)) {
      expect(typeof value, key).toBe('string')
    }
  })

  it('includes the provider honeypot field, left empty', () => {
    expect(payload.botcheck).toBe('')
  })
})
