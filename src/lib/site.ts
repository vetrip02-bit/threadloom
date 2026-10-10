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

/**
 * Public contact details.
 *
 * These are read from the environment so a deployment can be given real
 * details without a code change - and so the "email or call us directly"
 * fallback on the enquiry forms always shows something a customer can act on.
 */
export const CONTACT = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || '[sales@yourdomain.com]',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || '[+91 00000 00000]',
  whatsapp: process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || '[+91 00000 00000]',
  addressLines: (process.env.NEXT_PUBLIC_CONTACT_ADDRESS?.trim() || '[Unit / Street]|[Area, City]|[State - PIN]|India').split('|'),
  gstin: process.env.NEXT_PUBLIC_GSTIN?.trim() || '[GSTIN - add once available]',
  hours: process.env.NEXT_PUBLIC_CONTACT_HOURS?.trim() || '[Mon-Sat, 10:00-18:00 IST]',
} as const

/** True once a real contact email has been configured. */
export const HAS_REAL_CONTACT_EMAIL = Boolean(
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim(),
)

/** TODO(owner): replace the `#` placeholders with your real profile URLs. */
export const SOCIAL = [
  { label: 'LinkedIn', href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'Facebook', href: '#' },
  { label: 'YouTube', href: '#' },
] as const

/**
 * Canonical origin, in order of preference:
 *   1. NEXT_PUBLIC_SITE_URL  - set this to your custom domain in production.
 *   2. The Vercel-provided deployment URL, so preview and first-time
 *      deployments produce correct canonicals, Open Graph URLs and sitemap
 *      entries without any manual configuration.
 *   3. localhost, for local development.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '')
  if (explicit) return explicit

  const vercelHost = (
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    process.env.VERCEL_URL ||
    ''
  )
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
  if (vercelHost) return 'https://' + vercelHost

  return 'http://localhost:3000'
}

export const SITE_URL = resolveSiteUrl()

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
