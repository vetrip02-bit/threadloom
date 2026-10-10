import type { Metadata } from 'next'

import { Hero } from '@/components/home/Hero'
import { TrustStrip } from '@/components/home/TrustStrip'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { ProductGrid } from '@/components/home/ProductGrid'
import { ProcessSteps } from '@/components/home/ProcessSteps'
import { CustomizationSection } from '@/components/home/CustomizationSection'
import { IndustriesSection } from '@/components/home/IndustriesSection'
import { QuoteCta } from '@/components/home/QuoteCta'
import { BRAND } from '@/lib/site'

export const metadata: Metadata = {
  title: BRAND.name + ' — Wholesale Uniforms & Corporate Workwear',
  description:
    'Bulk uniforms for schools, corporate teams, hospitality, events and sports, with custom embroidery and printing. Request a quote for volume pricing.',
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <CategoryGrid />
      <ProductGrid />
      <ProcessSteps />
      <CustomizationSection />
      <IndustriesSection />
      <QuoteCta />
    </>
  )
}
