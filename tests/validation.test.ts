import { describe, expect, it } from 'vitest'

import { fieldErrors, quoteRequestSchema, sanitize } from '@/lib/validation/schemas'

const validQuote = {
  firstName: 'Asha',
  lastName: 'Menon',
  organization: 'Lakeside Public School',
  email: 'Asha.Menon@Example.com',
  phone: '+91 98765 43210',
  city: 'Kochi',
  customerType: 'School / College' as const,
  requirements: 'Summer uniform sets for 420 students across classes 1 to 10.',
  estimatedQuantity: 420,
  expectedDate: '2026-04-15',
  consent: true as const,
  items: [],
  source: 'quote' as const,
}

describe('sanitize', () => {
  it('collapses whitespace and trims', () => {
    expect(sanitize('  Lakeside   Public\tSchool \n')).toBe('Lakeside Public School')
  })

  it('strips control characters', () => {
    const withControlChars = 'Acme' + String.fromCharCode(0, 7, 27) + 'Uniforms'
    expect(sanitize(withControlChars)).toBe('Acme Uniforms')
  })
})

describe('quoteRequestSchema', () => {
  it('accepts a complete enquiry', () => {
    const result = quoteRequestSchema.safeParse(validQuote)
    expect(result.success).toBe(true)
  })

  it('lowercases and trims the email address', () => {
    const result = quoteRequestSchema.parse(validQuote)
    expect(result.email).toBe('asha.menon@example.com')
  })

  it('strips formatting from the phone number', () => {
    const result = quoteRequestSchema.parse(validQuote)
    expect(result.phone).toBe('+919876543210')
  })

  it('rejects a missing consent checkbox', () => {
    const result = quoteRequestSchema.safeParse({ ...validQuote, consent: false })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(fieldErrors(result.error).consent).toMatch(/confirm you agree/i)
    }
  })

  it('rejects an invalid email address', () => {
    const result = quoteRequestSchema.safeParse({ ...validQuote, email: 'not-an-email' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(fieldErrors(result.error).email).toMatch(/valid email/i)
    }
  })

  it('rejects requirements that are too short', () => {
    const result = quoteRequestSchema.safeParse({ ...validQuote, requirements: 'ties' })
    expect(result.success).toBe(false)
  })

  it('coerces a numeric string quantity', () => {
    const result = quoteRequestSchema.parse({ ...validQuote, estimatedQuantity: '250' })
    expect(result.estimatedQuantity).toBe(250)
  })

  it('rejects a zero or negative quantity', () => {
    expect(
      quoteRequestSchema.safeParse({ ...validQuote, estimatedQuantity: 0 }).success,
    ).toBe(false)
    expect(
      quoteRequestSchema.safeParse({ ...validQuote, estimatedQuantity: -5 }).success,
    ).toBe(false)
  })

  it('requires a customer type so the enquiry can be routed', () => {
    const { customerType: _omitted, ...withoutType } = validQuote
    expect(quoteRequestSchema.safeParse(withoutType).success).toBe(false)
    expect(
      quoteRequestSchema.safeParse({ ...validQuote, customerType: 'Spaceship crew' })
        .success,
    ).toBe(false)
  })

  it('rejects a malformed expected date', () => {
    const result = quoteRequestSchema.safeParse({
      ...validQuote,
      expectedDate: '15/04/2026',
    })
    expect(result.success).toBe(false)
  })

  it('allows an empty expected date', () => {
    const result = quoteRequestSchema.parse({ ...validQuote, expectedDate: '' })
    expect(result.expectedDate).toBe('')
  })

  it('validates nested quote items', () => {
    const result = quoteRequestSchema.safeParse({
      ...validQuote,
      items: [
        {
          productId: 'round-neck-tee',
          productName: 'Combed Cotton Round-Neck Tee',
          category: 'custom-tshirts',
          quantity: 150,
          color: 'Navy',
          sizes: '40 M, 60 L, 50 XL',
          brandingMethod: 'Screen printing',
          notes: '',
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown branding method', () => {
    const result = quoteRequestSchema.safeParse({
      ...validQuote,
      items: [
        {
          productId: 'x',
          productName: 'X',
          category: 'custom-tshirts',
          quantity: 1,
          brandingMethod: 'Laser etching',
        },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('rejects more than fifty items', () => {
    const item = {
      productId: 'x',
      productName: 'X',
      category: 'custom-tshirts',
      quantity: 1,
      brandingMethod: 'Embroidery' as const,
    }
    const result = quoteRequestSchema.safeParse({
      ...validQuote,
      items: Array.from({ length: 51 }, () => item),
    })
    expect(result.success).toBe(false)
  })
})


describe('honeypot', () => {
  it('accepts a filled honeypot at the schema level so the route can discard it silently', () => {
    const result = quoteRequestSchema.safeParse({
      ...validQuote,
      company_website: 'http://spam.example',
    })
    // The schema must NOT reject here - a validation error would tell a bot
    // exactly which field gave it away.
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.company_website).toBe('http://spam.example')
    }
  })

  it('reports a required single-character field without awkward pluralisation', () => {
    const result = quoteRequestSchema.safeParse({ ...validQuote, firstName: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(fieldErrors(result.error).firstName).toBe('First name is required.')
    }
  })
})
