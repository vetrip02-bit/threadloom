import Link from 'next/link'

import { ButtonLink } from '@/components/ui/Button'
import { CATEGORIES } from '@/data/catalog'

export default function NotFound() {
  return (
    <div className="shell py-20 md:py-28">
      <div className="max-w-2xl">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-[32px] leading-tight md:text-[42px]">
          We could not find that page
        </h1>
        <p className="mt-5 text-[15.5px] leading-8 text-charcoal">
          The link may be out of date, or the page may have moved. Start from a
          category below, or send us your requirement directly.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/uniforms">Browse uniforms</ButtonLink>
          <ButtonLink href="/quote" variant="secondary">
            Request a quote
          </ButtonLink>
        </div>

        <nav aria-label="Categories" className="mt-12 border-t border-hairline pt-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy">
            Categories
          </h2>
          <ul className="mt-5 space-y-3">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  href={'/uniforms/' + category.slug}
                  className="text-[14.5px] text-charcoal underline-offset-4 transition-colors hover:text-burgundy hover:underline"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
