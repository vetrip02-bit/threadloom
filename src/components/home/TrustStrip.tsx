import { Headset, Palette, PackageCheck, Ruler } from 'lucide-react'

import { TRUST_POINTS } from '@/data/catalog'

const ICONS = {
  bulk: PackageCheck,
  branding: Palette,
  sizes: Ruler,
  assistance: Headset,
} as const

/**
 * Four factual capability statements. No certification, award, client count or
 * rating is claimed anywhere here.
 */
export function TrustStrip() {
  return (
    <section className="border-y border-hairline bg-ivory" aria-label="What we offer">
      <div className="shell py-10 md:py-12">
        <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_POINTS.map((point) => {
            const Icon = ICONS[point.id]
            return (
              <li key={point.id} className="flex gap-4">
                <Icon
                  size={22}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0 text-burgundy"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="text-[14.5px] font-semibold text-navy">{point.title}</h2>
                  <p className="mt-1.5 text-[13.5px] leading-6 text-charcoal">
                    {point.description}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
