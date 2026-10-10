/**
 * Single source of truth for business-specific copy and contact details.
 *
 * The brand name and tagline are set. Every bracketed value below is still a
 * placeholder the business owner must replace. Nothing in this file asserts a
 * certification, award, client, rating or testimonial.
 */
export const BRAND = {
  name: 'Threadloom',
  tagline: 'Uniforms that work as hard as your team.',
  description:
    'Wholesale uniforms, custom branding and bulk-order support for schools, corporate teams, hospitality, events and sports.',
} as const

/** TODO(owner): replace every placeholder below with your real details. */
export const CONTACT = {
  email: '[sales@yourdomain.com]',
  phone: '[+91 00000 00000]',
  whatsapp: '[+91 00000 00000]',
  addressLines: ['[Unit / Street]', '[Area, City]', '[State – PIN]', 'India'],
  gstin: '[GSTIN — add once available]',
  hours: '[Mon–Sat, 10:00–18:00 IST]',
} as const

/** TODO(owner): replace the `#` placeholders with your real profile URLs. */
export const SOCIAL = [
  { label: 'LinkedIn', href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'Facebook', href: '#' },
  { label: 'YouTube', href: '#' },
] as const

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000'

/**
 * Search-engine indexing is OFF unless explicitly enabled.
 *
 * This site ships with placeholder contact details, template legal pages and
 * sample pricing. Letting a search engine index those would publish wrong
 * information under the business's name, so turning indexing on is a
 * deliberate act: set NEXT_PUBLIC_ALLOW_INDEXING=true once the content in
 * CONTACT above, src/data/catalog.ts, /privacy and /terms is real.
 */
export const ALLOW_INDEXING = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/uniforms', label: 'Uniforms' },
  { href: '/industries', label: 'Industries' },
  { href: '/customization', label: 'Customization' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const

export const ANNOUNCEMENT =
  'Bulk uniforms • Custom branding • Enquire for volume pricing'
