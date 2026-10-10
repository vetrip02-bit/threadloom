import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { CATEGORIES } from '@/data/catalog'
import { Section, SectionHeading } from '@/components/ui/Section'
import type { Category } from '@/types'

function CategoryCard({ category, wide }: { category: Category; wide?: boolean }) {
  return (
    <Link
      href={'/uniforms/' + category.slug}
      className="group flex flex-col overflow-hidden rounded-card border border-hairline bg-white transition-shadow duration-300 ease-editorial hover:shadow-card"
    >
      <div
        className={
          'relative overflow-hidden bg-ivory ' +
          (wide ? 'aspect-[4/5] sm:aspect-[16/10]' : 'aspect-[4/5]')
        }
      >
        <Image
          src={category.image}
          alt={category.imageAlt}
          fill
          loading="lazy"
          sizes={
            wide
              ? '(min-width: 1024px) 620px, (min-width: 640px) 90vw, 100vw'
              : '(min-width: 1024px) 400px, (min-width: 640px) 45vw, 100vw'
          }
          className="object-cover object-top transition-transform duration-[600ms] ease-editorial group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="flex items-start justify-between gap-3 text-[17px] font-semibold text-navy md:text-[18px]">
          <span className="transition-colors duration-200 group-hover:text-burgundy">
            {category.name}
          </span>
          <ArrowUpRight
            size={18}
            strokeWidth={1.6}
            aria-hidden="true"
            className="mt-1 shrink-0 text-charcoal transition-all duration-200 ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-burgundy"
          />
        </h3>
        <p className="mt-2.5 text-[13.5px] leading-6 text-charcoal">{category.teaser}</p>
      </div>
    </Link>
  )
}

/**
 * Editorial grid: two wide cards on the first row, three equal cards on the
 * second, collapsing to a single column on mobile.
 */
export function CategoryGrid() {
  const [first, second, ...rest] = CATEGORIES

  return (
    <Section id="categories">
      <SectionHeading
        eyebrow="Shop by requirement"
        title="Five uniform programmes, one supplier"
        description="Pick the category closest to your requirement. Each one can be adjusted on fabric, colour, fit and branding before we quote."
        action={
          <Link
            href="/uniforms"
            className="inline-flex items-center gap-2 text-[13.5px] font-medium text-navy underline-offset-4 transition-colors hover:text-burgundy hover:underline"
          >
            View all uniforms
            <ArrowUpRight size={16} strokeWidth={1.7} aria-hidden="true" />
          </Link>
        }
      />

      <div className="grid gap-5 md:gap-6 lg:grid-cols-2">
        <CategoryCard category={first!} wide />
        <CategoryCard category={second!} wide />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {rest.map((category) => (
          <CategoryCard key={category.slug} category={category} />
        ))}
      </div>
    </Section>
  )
}
