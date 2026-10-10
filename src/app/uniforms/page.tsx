import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { CATEGORIES, PRODUCTS } from '@/data/catalog'
import { ProductCard } from '@/components/catalog/ProductCard'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section, SectionHeading } from '@/components/ui/Section'
import { QuoteCta } from '@/components/home/QuoteCta'

export const metadata: Metadata = {
  title: 'Uniforms',
  description:
    'Browse wholesale uniform categories: school and college uniforms, custom T-shirts, event merchandise, restaurant and hotel uniforms, and sports jerseys.',
  alternates: { canonical: '/uniforms' },
}

export default function UniformsPage() {
  return (
    <>
      <Breadcrumbs trail={[{ href: '/', label: 'Home' }, { href: '/uniforms', label: 'Uniforms' }]} />
      <PageHeader
        eyebrow="Our range"
        title="Uniforms for every part of your operation"
        description="Five categories, each built around how the garment is actually worn - the classroom, the kitchen pass, the event floor or the court."
      />

      <Section>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {CATEGORIES.map((category) => (
            <li key={category.slug}>
              <Link
                href={'/uniforms/' + category.slug}
                className="group flex h-full flex-col overflow-hidden rounded-card border border-hairline bg-white transition-shadow duration-300 ease-editorial hover:shadow-card"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
                  <Image
                    src={category.image}
                    alt={category.imageAlt}
                    fill
                    loading="lazy"
                    sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 100vw"
                    className="object-cover object-top transition-transform duration-[600ms] ease-editorial group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="flex items-start justify-between gap-3 text-[17px] font-semibold text-navy">
                    <span className="transition-colors duration-200 group-hover:text-burgundy">
                      {category.name}
                    </span>
                    <ArrowUpRight
                      size={17}
                      strokeWidth={1.6}
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-charcoal transition-all duration-200 ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-burgundy"
                    />
                  </h2>
                  <p className="mt-2.5 text-[13.5px] leading-6 text-charcoal">
                    {category.teaser}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2 border-t border-hairline pt-4">
                    {category.highlights.slice(0, 3).map((highlight) => (
                      <li
                        key={highlight}
                        className="rounded-[4px] bg-ivory px-2.5 py-1 text-[11.5px] text-charcoal"
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section surface="ivory">
        <SectionHeading
          eyebrow="Full sample range"
          title="Every line we currently show"
          description="Add any item to your quote bag. Quantities, sizes and branding are confirmed with you before pricing."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Section>

      <QuoteCta />
    </>
  )
}
