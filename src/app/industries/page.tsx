import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { CATEGORY_BY_SLUG, INDUSTRIES } from '@/data/catalog'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import { QuoteCta } from '@/components/home/QuoteCta'
import { assetPath } from '@/lib/asset'

export const metadata: Metadata = {
  title: 'Industries',
  description:
    'Uniform programmes for education, corporate teams, hospitality, events and sports — built around how each sector actually orders.',
  alternates: { canonical: '/industries' },
}

export default function IndustriesPage() {
  return (
    <>
      <Breadcrumbs
        trail={[{ href: '/', label: 'Home' }, { href: '/industries', label: 'Industries' }]}
      />
      <PageHeader
        eyebrow="Industries"
        title="Built around how your sector orders"
        description="A school buying for a full session and an agency buying for a three-day conference need very different things from a supplier. These are the patterns we plan for."
      />

      {INDUSTRIES.map((industry, index) => {
        const category = CATEGORY_BY_SLUG.get(industry.relatedCategory)!
        const reversed = index % 2 === 1

        return (
          <Section
            key={industry.id}
            id={industry.id}
            surface={reversed ? 'ivory' : 'white'}
            className="scroll-mt-24"
          >
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className={reversed ? 'lg:order-2' : undefined}>
                <p className="eyebrow">Industry</p>
                <h2 className="mt-3 text-[26px] leading-tight md:text-[32px]">
                  {industry.name}
                </h2>
                <p className="mt-4 max-w-xl text-[15px] leading-8 text-charcoal">
                  {industry.description}
                </p>
                <ul className="mt-7 space-y-3 border-t border-hairline pt-6">
                  {industry.needs.map((need) => (
                    <li key={need} className="flex gap-3 text-[14px] leading-7 text-charcoal">
                      <span
                        aria-hidden="true"
                        className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                      />
                      {need}
                    </li>
                  ))}
                </ul>
                <Link
                  href={'/uniforms/' + category.slug}
                  className="mt-7 inline-flex items-center gap-2 text-[14px] font-medium text-burgundy underline-offset-4 transition-colors hover:underline"
                >
                  Browse {category.name}
                  <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
                </Link>
              </div>

              <div
                className={
                  'relative aspect-[4/5] overflow-hidden rounded-image bg-ivory sm:aspect-[4/3] lg:aspect-[4/5] ' +
                  (reversed ? 'lg:order-1' : '')
                }
              >
                <Image
                  src={assetPath(category.image)}
                  alt={category.imageAlt}
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 560px, 100vw"
                  className="object-cover object-top"
                />
              </div>
            </div>
          </Section>
        )
      })}

      <QuoteCta />
    </>
  )
}
