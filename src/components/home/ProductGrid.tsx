import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { FEATURED_PRODUCTS } from '@/data/catalog'
import { ProductCard } from '@/components/catalog/ProductCard'
import { Section, SectionHeading } from '@/components/ui/Section'

export function ProductGrid() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Popular uniform solutions"
        title="Configure a line, add it to your quote"
        description="Pick a colour and add the item to your quote bag. Fabric, fit, sizes and branding are all confirmed with you before anything is priced."
        action={
          <Link
            href="/uniforms"
            className="inline-flex items-center gap-2 text-[13.5px] font-medium text-navy underline-offset-4 transition-colors hover:text-burgundy hover:underline"
          >
            See the full range
            <ArrowUpRight size={16} strokeWidth={1.7} aria-hidden="true" />
          </Link>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {FEATURED_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Section>
  )
}
