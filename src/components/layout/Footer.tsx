import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'

import { BRAND, CONTACT, SOCIAL } from '@/lib/site'
import { CATEGORIES } from '@/data/catalog'

const COMPANY_LINKS = [
  { href: '/about', label: 'About us' },
  { href: '/customization', label: 'Customization' },
  { href: '/industries', label: 'Industries' },
  { href: '/quote', label: 'Request a quote' },
  { href: '/contact', label: 'Contact' },
]

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-white">
      <div className="shell py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-12">
          <div>
            {/* TODO(owner): replace with your logo. */}
            <p className="text-[15px] font-semibold uppercase tracking-[0.16em] text-navy">
              {BRAND.name}
            </p>
            <p className="mt-4 max-w-xs text-[14px] leading-7 text-charcoal">
              {BRAND.tagline}
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {SOCIAL.map((item) => (
                <li key={item.label}>
                  {/* TODO(owner): point these at your real profiles. */}
                  <a
                    href={item.href}
                    className="text-[13px] text-charcoal transition-colors hover:text-burgundy"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-labelledby="footer-categories">
            <h2
              id="footer-categories"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy"
            >
              Categories
            </h2>
            <ul className="mt-5 space-y-3">
              {CATEGORIES.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={'/uniforms/' + category.slug}
                    className="text-[14px] text-charcoal transition-colors hover:text-burgundy"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-company">
            <h2
              id="footer-company"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy"
            >
              Company
            </h2>
            <ul className="mt-5 space-y-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-charcoal transition-colors hover:text-burgundy"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy">
              Contact
            </h2>
            {/* TODO(owner): replace every placeholder below in src/lib/site.ts */}
            <ul className="mt-5 space-y-4 text-[14px] text-charcoal">
              <li className="flex items-start gap-3">
                <MapPin size={16} strokeWidth={1.6} className="mt-1 shrink-0" aria-hidden="true" />
                <address className="not-italic leading-6">
                  {CONTACT.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} strokeWidth={1.6} className="shrink-0" aria-hidden="true" />
                <a href={'tel:' + CONTACT.phone} className="transition-colors hover:text-burgundy">
                  {CONTACT.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} strokeWidth={1.6} className="shrink-0" aria-hidden="true" />
                <a
                  href={'mailto:' + CONTACT.email}
                  className="break-all transition-colors hover:text-burgundy"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li className="text-[13px] text-charcoal/75">{CONTACT.hours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-hairline pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-[12.5px] text-charcoal/80">
            &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <li>
              <Link
                href="/privacy"
                className="text-[12.5px] text-charcoal transition-colors hover:text-burgundy"
              >
                Privacy policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-[12.5px] text-charcoal transition-colors hover:text-burgundy"
              >
                Terms of use
              </Link>
            </li>
            <li className="text-[12.5px] text-charcoal/80">GSTIN: {CONTACT.gstin}</li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
