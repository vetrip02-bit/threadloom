import type { Metadata } from 'next'
import Image from 'next/image'

import { CUSTOMIZATION_OPTIONS } from '@/data/catalog'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section, SectionHeading } from '@/components/ui/Section'
import { CustomizationRequestForm } from '@/components/quote/CustomizationRequestForm'
import { assetPath } from '@/lib/asset'

export const metadata: Metadata = {
  title: 'Customization',
  description:
    'Screen printing, embroidery, heat transfer, fabric and colour selection and custom size runs for wholesale uniform orders.',
  alternates: { canonical: '/customization' },
}

/** Only questions that are actually rendered below are described in JSON-LD. */
const FAQS = [
  {
    question: 'Which branding method should I choose?',
    answer:
      'Embroidery suits structured garments like blazers, polos and caps. Screen printing suits large runs with a fixed, limited-colour logo on cotton knits. Heat transfer handles gradients and per-piece names and numbers, which is why it is the usual choice for sports jerseys.',
  },
  {
    question: 'Can you match our exact brand colour?',
    answer:
      'We match shades against a physical fabric swatch before bulk production, and keep that reference for repeat orders. Screen and dye results vary slightly between fabric types, so the approved swatch is the reference, not an on-screen colour.',
  },
  {
    question: 'Do you produce a sample before the bulk order?',
    answer:
      'Yes. A sample set is produced against your approved specification so fit, fabric and branding can be checked before the bulk cut begins.',
  },
  {
    question: 'Can one order include different sizes and age groups?',
    answer:
      'Yes. Youth through extended adult sizes can run within the same order, and we can produce a size set from your own measurement chart first.',
  },
]

function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}

export default function CustomizationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />
      <Breadcrumbs
        trail={[
          { href: '/', label: 'Home' },
          { href: '/customization', label: 'Customization' },
        ]}
      />
      <PageHeader
        eyebrow="Customization"
        title="Your branding, applied the right way"
        description="The technique matters as much as the artwork. We pick the method that survives how the uniform is actually worn, washed and replaced."
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-16">
          <ul className="divide-y divide-hairline border-y border-hairline">
            {CUSTOMIZATION_OPTIONS.map((option) => (
              <li key={option.id} id={option.id} className="scroll-mt-28 py-7">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <h2 className="text-[18px] font-semibold text-navy">{option.title}</h2>
                  <p className="shrink-0 text-[12px] uppercase tracking-[0.1em] text-charcoal/80">
                    {option.bestFor}
                  </p>
                </div>
                <p className="mt-3 max-w-2xl text-[14px] leading-7 text-charcoal">
                  {option.description}
                </p>
              </li>
            ))}
          </ul>

          <div className="relative aspect-[4/5] overflow-hidden rounded-image bg-ivory lg:sticky lg:top-28">
            <Image
              src={assetPath("/images/event-merchandise.png")}
              alt="Branded navy polo shirts, caps, lanyards and canvas tote bags laid out on an event counter."
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 460px, 100vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </Section>

      <Section surface="ivory" id="request" className="scroll-mt-24">
        <SectionHeading
          eyebrow="Start here"
          title="Start a customization request"
          description="Describe the garments, your artwork and the finish you have in mind. We respond with a branding recommendation and a mock-up."
        />
        <div className="max-w-3xl">
          <CustomizationRequestForm />
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Questions" title="Common customization questions" />
        <dl className="divide-y divide-hairline border-y border-hairline">
          {FAQS.map((faq) => (
            <div key={faq.question} className="py-6">
              <dt className="text-[16px] font-semibold text-navy">{faq.question}</dt>
              <dd className="mt-2.5 max-w-3xl text-[14px] leading-7 text-charcoal">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </Section>
    </>
  )
}
