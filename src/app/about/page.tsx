import type { Metadata } from 'next'
import Image from 'next/image'

import { BRAND } from '@/lib/site'
import { PROCESS_STEPS, TRUST_POINTS } from '@/data/catalog'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section, SectionHeading } from '@/components/ui/Section'
import { QuoteCta } from '@/components/home/QuoteCta'
import { assetPath } from '@/lib/asset'

export const metadata: Metadata = {
  title: 'About',
  description:
    'How we work as a wholesale uniform supplier: enquiry-led ordering, sampling before bulk, and one point of contact from brief to delivery.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <>
      <Breadcrumbs trail={[{ href: '/', label: 'Home' }, { href: '/about', label: 'About' }]} />
      <PageHeader
        eyebrow="About us"
        title="A wholesale uniform supplier, not a retail shop"
        description={BRAND.tagline}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16">
          <div className="max-w-2xl space-y-5 text-[15px] leading-8 text-charcoal">
            {/* TODO(owner): replace this section with your own company story. */}
            <p>
              {BRAND.name} supplies uniforms in bulk to organisations that need the same
              garment, in the same colour, to the same standard, order after order. We
              work on an enquiry-and-quote basis rather than a consumer checkout,
              because volume pricing depends on fabric, quantity, branding and timeline
              — four things no shopping cart can decide on its own.
            </p>
            <p>
              A typical engagement starts with a brief: the roles to be dressed, rough
              numbers and the date stock is needed. We come back with fabric options and
              a branding recommendation, produce a sample for sign-off, and only then
              cut bulk. That sequence is deliberate — it is cheaper to change a sample
              than a production run.
            </p>
            <p>
              Repeat orders run against the approved specification, so a mid-year
              replacement or a new joiner&rsquo;s kit matches what the rest of the team
              is already wearing.
            </p>
            <p className="rounded-card border border-hairline bg-ivory p-5 text-[13.5px] leading-7">
              <strong className="font-semibold text-navy">Editable content.</strong> This
              page is placeholder copy describing a general wholesale workflow. Replace
              it with your own history, capacity and facilities before publishing — and
              only add certifications, client names or figures you can evidence.
            </p>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-image bg-ivory">
            <Image
              src={assetPath("/images/hospitality-uniforms.png")}
              alt="A bell-desk attendant in a burgundy bandhgala and a service associate in a waistcoat in a hotel lobby."
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 500px, 100vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </Section>

      <Section surface="ivory">
        <SectionHeading eyebrow="How we work" title="What you can expect from us" />
        <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_POINTS.map((point) => (
            <li key={point.id} className="border-t-2 border-navy pt-5">
              <h3 className="text-[15px] font-semibold text-navy">{point.title}</h3>
              <p className="mt-2 text-[13.5px] leading-7 text-charcoal">
                {point.description}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <SectionHeading eyebrow="Process" title="The route every order takes" />
        <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step) => (
            <li key={step.step}>
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-navy text-[14px] font-semibold text-navy"
              >
                {step.step}
              </span>
              <h3 className="mt-4 text-[16px] font-semibold text-navy">
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

      <QuoteCta />
    </>
  )
}
