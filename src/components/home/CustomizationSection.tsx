import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import { CUSTOMIZATION_OPTIONS } from '@/data/catalog'
import { Section, SectionHeading } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { assetPath } from '@/lib/asset'

export function CustomizationSection() {
  return (
    <Section id="customization">
      <SectionHeading
        eyebrow="Customization"
        title="Your branding, applied the right way"
        description="Different artwork and different garments call for different techniques. We recommend the one that holds up for how the uniform is actually worn and washed."
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)] lg:gap-14">
        <ul className="divide-y divide-hairline border-y border-hairline">
          {CUSTOMIZATION_OPTIONS.map((option) => (
            <li key={option.id} className="py-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <h3 className="text-[16px] font-semibold text-navy">{option.title}</h3>
                <p className="shrink-0 text-[12px] uppercase tracking-[0.1em] text-charcoal/80">
                  {option.bestFor}
                </p>
              </div>
              <p className="mt-2.5 max-w-2xl text-[13.5px] leading-7 text-charcoal">
                {option.description}
              </p>
            </li>
          ))}
        </ul>

        <div className="flex flex-col">
          <div className="relative aspect-[4/5] overflow-hidden rounded-image bg-ivory">
            <Image
              src={assetPath("/images/custom-tshirts.png")}
              alt="Three people wearing plain white, burgundy and navy round-neck T-shirts ready for custom branding."
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 460px, 100vw"
              className="object-cover object-top"
            />
          </div>
          <div className="mt-6 rounded-card border border-hairline p-6">
            <h3 className="text-[16px] font-semibold text-navy">
              Start a customization request
            </h3>
            <p className="mt-2 text-[13.5px] leading-7 text-charcoal">
              Send your logo, preferred colours and the garments you have in mind. We
              come back with a branding recommendation and a mock-up.
            </p>
            <ButtonLink href="/customization#request" className="mt-5 w-full sm:w-auto">
              Start a customization request
              <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </div>
    </Section>
  )
}
