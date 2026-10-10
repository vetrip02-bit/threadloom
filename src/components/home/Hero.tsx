import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import { ButtonLink } from '@/components/ui/Button'

/**
 * Homepage hero.
 *
 * The source image keeps the people on the right third of the frame, so on
 * desktop the photo sits in its own column and the copy keeps a plain white
 * background - no dark scrim over the image, and no text over faces.
 */
export function Hero() {
  return (
    <section className="bg-white" aria-labelledby="hero-heading">
      <div className="shell">
        <div className="grid items-center gap-10 py-12 md:py-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14 lg:py-20">
          <div className="max-w-xl animate-fade-up">
            <p className="eyebrow">Wholesale uniforms, tailored for teams</p>
            <h1
              id="hero-heading"
              className="mt-5 text-[34px] leading-[1.12] md:text-[46px] lg:text-[52px]"
            >
              Professional uniforms.
              <span className="block text-burgundy">Made for every role.</span>
            </h1>
            <p className="mt-6 max-w-lg text-[15.5px] leading-8 text-charcoal md:text-[16.5px]">
              From classrooms and kitchens to events and sports teams, source
              dependable uniforms with custom colours, fits and branding.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/quote" size="lg">
                Request a Quote
                <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="#categories" variant="secondary" size="lg">
                Explore Categories
              </ButtonLink>
            </div>

            <p className="mt-8 border-l-2 border-gold pl-4 text-[13px] leading-6 text-charcoal/85">
              Enquiry-led ordering: tell us the roles, quantities and dates, and we
              come back with a written quote.
            </p>
          </div>

          <div className="relative">
            <div className="relative aspect-[16/9] overflow-hidden rounded-image bg-ivory lg:aspect-[16/10]">
              <Image
                src="/images/hero-uniforms.png"
                alt="A team in professional uniforms: a corporate suit, a student blazer, a hospitality tunic, a chef coat and sportswear."
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 1280px) 680px, (min-width: 1024px) 55vw, 100vw"
                className="object-cover object-[78%_center] lg:object-[72%_center]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
