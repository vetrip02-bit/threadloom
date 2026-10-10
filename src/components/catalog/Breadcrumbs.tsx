import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import { SITE_URL } from '@/lib/site'

export interface Crumb {
  href: string
  label: string
}

export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: SITE_URL + crumb.href,
    })),
  }

  return (
    <nav aria-label="Breadcrumb" className="border-b border-hairline bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="shell">
        <ol className="flex flex-wrap items-center gap-1.5 py-4 text-[12.5px]">
          {trail.map((crumb, index) => {
            const last = index === trail.length - 1
            return (
              <li key={crumb.href} className="flex items-center gap-1.5">
                {last ? (
                  <span aria-current="page" className="text-charcoal/80">
                    {crumb.label}
                  </span>
                ) : (
                  <>
                    <Link
                      href={crumb.href}
                      className="text-navy underline-offset-4 transition-colors hover:text-burgundy hover:underline"
                    >
                      {crumb.label}
                    </Link>
                    <ChevronRight
                      size={13}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className="text-charcoal/75"
                    />
                  </>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
