import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { INDUSTRIES } from '@/data/catalog'
import { Section, SectionHeading } from '@/components/ui/Section'

export function IndustriesSection() {
  return (
    <Section surface="ivory" id="industries">
      <SectionHeading
        eyebrow="Industries"
        title="Teams we dress"
        description="Every sector runs its uniform programme differently. These are the patterns we build around."
      />

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {INDUSTRIES.map((industry) => (
          <li key={industry.id}>
            <Link
              href={'/industries#' + industry.id}
              className="group flex h-full flex-col rounded-card border border-hairline bg-white p-6 transition-shadow duration-300 ease-editorial hover:shadow-card"
            >
              <h3 className="flex items-start justify-between gap-3 text-[16.5px] font-semibold text-navy">
                <span className="transition-colors duration-200 group-hover:text-burgundy">
                  {industry.name}
                </span>
                <ArrowUpRight
                  size={17}
                  strokeWidth={1.6}
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-charcoal transition-all duration-200 ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-burgundy"
                />
              </h3>
              <p className="mt-2.5 text-[13.5px] leading-6 text-charcoal">
                {industry.description}
              </p>
              <ul className="mt-4 space-y-2 border-t border-hairline pt-4">
                {industry.needs.map((need) => (
                  <li
                    key={need}
                    className="flex gap-2.5 text-[13px] leading-6 text-charcoal"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-gold"
                    />
                    {need}
                  </li>
                ))}
              </ul>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}
