'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'

import { CATEGORIES, PRODUCTS } from '@/data/catalog'
import { Scrim, useModalBehaviour } from '@/components/ui/Overlay'

interface Result {
  href: string
  title: string
  context: string
}

const INDEX: Result[] = [
  ...CATEGORIES.map((category) => ({
    href: '/uniforms/' + category.slug,
    title: category.name,
    context: 'Category',
  })),
  ...PRODUCTS.map((product) => ({
    href: '/uniforms/' + product.category + '#' + product.id,
    title: product.name,
    context: product.categoryLabel,
  })),
  { href: '/customization', title: 'Customization options', context: 'Page' },
  { href: '/industries', title: 'Industries we supply', context: 'Page' },
  { href: '/quote', title: 'Request a quote', context: 'Page' },
  { href: '/contact', title: 'Contact us', context: 'Page' },
]

export function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const containerRef = useModalBehaviour(open, onClose)
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (term.length < 2) return []
    return INDEX.filter(
      (entry) =>
        entry.title.toLowerCase().includes(term) ||
        entry.context.toLowerCase().includes(term),
    ).slice(0, 8)
  }, [query])

  if (!open) return null

  const showEmptyState = query.trim().length >= 2 && results.length === 0

  return (
    <>
      <Scrim onClick={onClose} />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        tabIndex={-1}
        className="fixed inset-x-0 top-0 z-50 animate-fade-in border-b border-hairline bg-white"
      >
        <div className="shell py-5">
          <div className="flex items-center gap-3">
            <Search size={19} strokeWidth={1.6} className="text-charcoal" aria-hidden="true" />
            <label htmlFor="site-search" className="sr-only">
              Search uniforms, categories and pages
            </label>
            <input
              id="site-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search uniforms, categories or pages"
              autoComplete="off"
              className="h-10 w-full border-0 bg-transparent text-[15px] text-navy placeholder:text-charcoal/75 focus:outline-none"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] text-navy transition-colors hover:bg-ivory"
            >
              <X size={20} strokeWidth={1.6} aria-hidden="true" />
            </button>
          </div>

          <div aria-live="polite" className="mt-2">
            {results.length > 0 ? (
              <ul className="divide-y divide-hairline border-t border-hairline">
                {results.map((result) => (
                  <li key={result.href + result.title}>
                    <Link
                      href={result.href}
                      onClick={onClose}
                      className="flex items-baseline justify-between gap-4 py-3 transition-colors hover:text-burgundy"
                    >
                      <span className="text-[14px] font-medium text-navy">
                        {result.title}
                      </span>
                      <span className="shrink-0 text-[12px] text-charcoal/80">
                        {result.context}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}

            {showEmptyState ? (
              <p className="border-t border-hairline py-4 text-[14px] text-charcoal">
                No matches for &ldquo;{query.trim()}&rdquo;. Try a category name, or{' '}
                <Link href="/contact" onClick={onClose} className="font-medium text-burgundy underline underline-offset-4">
                  send us your requirement
                </Link>
                .
              </p>
            ) : null}

            {query.trim().length < 2 ? (
              <p className="border-t border-hairline py-4 text-[13px] text-charcoal/75">
                Type at least two characters. Try &ldquo;blazer&rdquo;, &ldquo;polo&rdquo; or
                &ldquo;jersey&rdquo;.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}
