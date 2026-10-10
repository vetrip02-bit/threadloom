import type { Metadata } from 'next'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'

import { CONTACT } from '@/lib/site'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import { ContactForm } from '@/components/quote/ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Send your wholesale uniform requirement, or reach our sales desk by phone or email.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <>
      <Breadcrumbs
        trail={[{ href: '/', label: 'Home' }, { href: '/contact', label: 'Contact' }]}
      />
      <PageHeader
        eyebrow="Contact"
        title="Talk to our sales desk"
        description="Send a requirement through the form, or reach us directly. We reply with options and a written quote — no payment is taken on this site."
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.62fr)] lg:gap-16">
          <div>
            <h2 className="text-[20px]">Send an enquiry</h2>
            <div className="mt-7">
              <ContactForm />
            </div>
          </div>

          <aside className="space-y-5">
            {/* TODO(owner): every detail below is a placeholder in src/lib/site.ts */}
            <div className="rounded-card border border-hairline p-6">
              <h2 className="text-[16px] font-semibold text-navy">Direct contact</h2>
              <ul className="mt-5 space-y-5 text-[14px] text-charcoal">
                <li className="flex items-start gap-3">
                  <MapPin size={17} strokeWidth={1.6} className="mt-0.5 shrink-0 text-burgundy" aria-hidden="true" />
                  <address className="not-italic leading-7">
                    {CONTACT.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={17} strokeWidth={1.6} className="shrink-0 text-burgundy" aria-hidden="true" />
                  <a href={'tel:' + CONTACT.phone} className="transition-colors hover:text-burgundy">
                    {CONTACT.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={17} strokeWidth={1.6} className="shrink-0 text-burgundy" aria-hidden="true" />
                  <a
                    href={'mailto:' + CONTACT.email}
                    className="break-all transition-colors hover:text-burgundy"
                  >
                    {CONTACT.email}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Clock size={17} strokeWidth={1.6} className="shrink-0 text-burgundy" aria-hidden="true" />
                  {CONTACT.hours}
                </li>
              </ul>
            </div>

            <div className="rounded-card border border-hairline bg-ivory p-6">
              <h2 className="text-[15px] font-semibold text-navy">Already have a list?</h2>
              <p className="mt-2 text-[13.5px] leading-7 text-charcoal">
                Attach your size-wise breakup to an email and we will quote directly
                against it. For catalogue items, the quote builder is usually faster.
              </p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  )
}
