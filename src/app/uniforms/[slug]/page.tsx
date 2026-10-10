import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, Check } from 'lucide-react'

import { CATEGORIES, CATEGORY_BY_SLUG, productsByCategory, INDUSTRIES } from '@/data/catalog'
import { ProductCard } from '@/components/catalog/ProductCard'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { Section, SectionHeading } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { QuoteCta } from '@/components/home/QuoteCta'
import type { CategorySlug } from '@/types'

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = CATEGORY_BY_SLUG.get(slug as CategorySlug)
  if (!category) return { title: 'Category not found' }

  return {
    title: category.name,
    description: category.description.slice(0, 160),
    alternates: { canonical: '/uniforms/' + category.slug },
    openGraph: {
      title: category.name,
      description: category.description.slice(0, 200),
      images: [{ url: category.image, alt: category.imageAlt }],
    },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = CATEGORY_BY_SLUG.get(slug as CategorySlug)
  if (!category) notFound()

  const products = productsByCategory(category.slug)
  const relatedIndustries = INDUSTRIES.filter(
    (industry) => industry.relatedCategory === category.slug,
  )

  return (
    <>
      <Breadcrumbs
        trail={[
          { href: '/', label: 'Home' },
          { href: '/uniforms', label: 'Uniforms' },
          { href: '/uniforms/' + category.slug, label: category.name },
        ]}
      />

      <section className="bg-white">
        <div className="shell">
          <div className="grid items-center gap-10 py-10 md:py-14 lg:grid-cols-2 lg:gap-14">
            <div className="max-w-xl">
              <p className="eyebrow">Category</p>
              <h1 className="mt-4 text-[30px] leading-[1.15] md:text-[42px]">
                {category.name}
              </h1>
              <p className="mt-5 text-[15.5px] leading-8 text-charcoal">
                {category.description}
              </p>
              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {category.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2.5 text-[13.5px] text-charcoal">
                    <Check
                      size={15}
                      strokeWidth={2}
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-burgundy"
                    />
                    {highlight}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/quote">Request a Quote</ButtonLink>
                <ButtonLink href="/customization" variant="secondary">
                  Customization options
                </ButtonLink>
              </div>
            </div>

            <div className="relative aspect-[4/5] overflow-hidden rounded-image bg-ivory sm:aspect-[4/3] lg:aspect-[4/5]">
              <Image
                src={category.image}
                alt={category.imageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 600px, 100vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      <Section surface="ivory">
        <SectionHeading
          eyebrow="Sample lines"
          title={'Lines we show in ' + category.name.toLowerCase()}
          description="Sample products with editable specifications. Add what fits and we will quote the set together."
        />
        {products.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-hairline bg-white p-10 text-center">
            <h3 className="text-[17px]">Nothing listed here yet</h3>
            <p className="mx-auto mt-2 max-w-md text-[14px] leading-7 text-charcoal">
              We have not published sample lines for this category. Send us your
              requirement and we will quote against your own specification.
            </p>
            <ButtonLink href="/quote" className="mt-6">
              Send your requirement
            </ButtonLink>
          </div>
        )}
      </Section>

      {relatedIndustries.length > 0 ? (
        <Section>
          <SectionHeading
            eyebrow="Who this suits"
            title="Typically ordered by"
          />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedIndustries.map((industry) => (
              <li key={industry.id}>
                <Link
                  href={'/industries#' + industry.id}
                  className="group flex h-full flex-col rounded-card border border-hairline p-6 transition-shadow duration-300 hover:shadow-card"
                >
                  <h3 className="flex items-start justify-between gap-3 text-[16px] font-semibold text-navy group-hover:text-burgundy">
                    {industry.name}
                    <ArrowUpRight size={16} strokeWidth={1.6} aria-hidden="true" className="mt-1 shrink-0" />
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-6 text-charcoal">
                    {industry.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <QuoteCta />
    </>
  )
}
