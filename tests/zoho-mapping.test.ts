import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  buildQuoteDescription,
  buildQuoteRecord,
  formatQuoteItems,
  QUOTE_FIELD_MAP,
} from '@/lib/zoho/mapping'
import type { QuoteRequestInput } from '@/lib/validation/schemas'

const quote: QuoteRequestInput = {
  firstName: 'Asha',
  lastName: 'Menon',
  organization: 'Lakeside Public School',
  email: 'asha.menon@example.com',
  phone: '+919876543210',
  city: 'Kochi',
  customerType: 'School / College',
  requirements: 'Summer uniform sets for 420 students.',
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
      sizes: '120 x 28, 180 x 30, 120 x 32',
      brandingMethod: 'Embroidery',
      notes: 'Crest on left chest',
    },
    {
      productId: 'school-blazer-set',
      productName: 'School Blazer & Trouser Set',
      category: 'school-college-uniforms',
      quantity: 200,
      color: 'Navy',
      sizes: '',
      brandingMethod: 'Woven label',
      notes: '',
    },
  ],
}

describe('formatQuoteItems', () => {
  it('renders one numbered line per item', () => {
    const summary = formatQuoteItems(quote.items)
    const lines = summary.split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[0]).toContain('1. Classic Uniform Shirt')
    expect(lines[0]).toContain('Qty 420')
    expect(lines[0]).toContain('Branding: Embroidery')
  })

  it('omits the parts an item does not have', () => {
    const summary = formatQuoteItems([quote.items[1]!])
    expect(summary).not.toContain('Sizes:')
    expect(summary).not.toContain('Notes:')
  })

  it('handles an empty bag', () => {
    expect(formatQuoteItems([])).toBe('No catalogue items selected.')
  })
})

describe('buildQuoteRecord', () => {
  it('maps the stock Leads fields', () => {
    const record = buildQuoteRecord(quote, '2026-02-01T09:00:00.000Z')
    expect(record[QUOTE_FIELD_MAP.firstName]).toBe('Asha')
    expect(record[QUOTE_FIELD_MAP.lastName]).toBe('Menon')
    expect(record[QUOTE_FIELD_MAP.company]).toBe('Lakeside Public School')
    expect(record[QUOTE_FIELD_MAP.email]).toBe('asha.menon@example.com')
    expect(record[QUOTE_FIELD_MAP.city]).toBe('Kochi')
  })

  it('puts the full enquiry into Description while custom fields are unmapped', () => {
    const record = buildQuoteRecord(quote, '2026-02-01T09:00:00.000Z')
    const description = String(record[QUOTE_FIELD_MAP.description])
    expect(description).toContain('Estimated quantity: 420')
    expect(description).toContain('Expected by: 2026-04-15')
    expect(description).toContain('Classic Uniform Shirt')
    expect(description).toContain('School Blazer & Trouser Set')
  })

  it('leaves the expected-date line out when no date was given', () => {
    const description = buildQuoteDescription({ ...quote, expectedDate: '' })
    expect(description).not.toContain('Expected by:')
  })

  it('labels the enquiry source', () => {
    const description = buildQuoteDescription({ ...quote, source: 'customization' })
    expect(description).toContain('Source: customization')
  })
})

describe('zoho client configuration', () => {
  const ENV = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    process.env = { ...ENV }
    vi.unstubAllGlobals()
  })

  it('reports as unconfigured when credentials are missing', async () => {
    const { isZohoConfigured } = await import('@/lib/zoho/client')
    expect(
      isZohoConfigured({
        ZOHO_CLIENT_ID: '',
        ZOHO_CLIENT_SECRET: '',
        ZOHO_REFRESH_TOKEN: '',
      }),
    ).toBe(false)
  })

  it('reads a complete configuration', async () => {
    const { readZohoConfig } = await import('@/lib/zoho/client')
    const config = readZohoConfig({
      ZOHO_CLIENT_ID: 'id',
      ZOHO_CLIENT_SECRET: 'secret',
      ZOHO_REFRESH_TOKEN: 'refresh',
      ZOHO_ACCOUNTS_URL: 'https://accounts.zoho.in/',
      ZOHO_API_DOMAIN: 'https://www.zohoapis.in/',
    })

    expect(config.accountsUrl).toBe('https://accounts.zoho.in')
    expect(config.apiDomain).toBe('https://www.zohoapis.in')
    expect(config.quoteModule).toBe('Leads')
  })

  it('prefers the api_domain returned by Zoho over the configured fallback', async () => {
    const { refreshAccessToken, __clearTokenCache } = await import('@/lib/zoho/client')
    __clearTokenCache()

    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            access_token: '1000.testtoken',
            api_domain: 'https://www.zohoapis.eu',
            expires_in: 3600,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    )

    const result = await refreshAccessToken({
      clientId: 'id',
      clientSecret: 'secret',
      refreshToken: 'refresh',
      accountsUrl: 'https://accounts.zoho.in',
      apiDomain: 'https://www.zohoapis.in',
      quoteModule: 'Leads',
    })

    expect(result.apiDomain).toBe('https://www.zohoapis.eu')
    __clearTokenCache()
  })

  it('redacts tokens and secrets before logging', async () => {
    const { redactForLog } = await import('@/lib/zoho/client')
    const message = redactForLog(
      new Error('failed with 1000.abcdef0123456789 and client_secret=supersecret'),
    )
    expect(message).not.toContain('abcdef0123456789')
    expect(message).not.toContain('supersecret')
    expect(message).toContain('[redacted-zoho-token]')
  })
})
