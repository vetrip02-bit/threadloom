import type { Metadata } from 'next'

import { QuoteForm } from '@/components/quote/QuoteForm'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import { PROCESS_STEPS } from '@/data/catalog'

export const metadata: Metadata = {
  title: 'Request a Quote',
  description:
    'Send your uniform requirement — roles, quantities, sizes, branding and delivery date — and receive a written wholesale quote.',
  alternates: { canonical: '/quote' },
}

export default function QuotePage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { href: '/', label: 'Home' },
          { href: '/quote', label: 'Request a quote' },
        ]}
      />
      <PageHeader
        eyebrow="Quote builder"
        title="Request a quote"
        description="Tell us what your team needs to wear. Add catalogue items, adjust quantities and sizes, then send it across — there is no checkout and no payment on this site."
      />

      <Section>
        <QuoteForm />
      </Section>

      <Section surface="ivory">
        <h2 className="text-[22px] md:text-[26px]">What happens next</h2>
        <ol className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step) => (
            <li key={step.step}>
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-navy text-[13px] font-semibold text-navy"
              >
                {step.step}
              </span>
              <h3 className="mt-4 text-[15px] font-semibold text-navy">
                <span className="sr-only">Step {step.step}: </span>
                {step.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-7 text-charcoal">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Section>
    </>
  )
}
