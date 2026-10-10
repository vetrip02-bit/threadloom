'use client'

import Link from 'next/link'
import { ChevronRight, X } from 'lucide-react'

import { BRAND, NAV_LINKS } from '@/lib/site'
import { CATEGORIES } from '@/data/catalog'
import { Scrim, useModalBehaviour } from '@/components/ui/Overlay'
import { ButtonLink } from '@/components/ui/Button'
import { MobileAuthLinks } from '@/components/auth/MobileAuthLinks'

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const containerRef = useModalBehaviour(open, onClose)

  if (!open) return null

  return (
    <>
      <Scrim onClick={onClose} />
      <div
        ref={containerRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        tabIndex={-1}
        className="fixed inset-y-0 left-0 z-50 flex w-[min(88vw,360px)] animate-fade-in flex-col bg-white shadow-lifted lg:hidden"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-hairline px-5">
          <span className="text-[14px] font-semibold uppercase tracking-[0.16em] text-navy">
            {BRAND.name}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-[6px] text-navy transition-colors hover:bg-ivory"
          >
            <X size={20} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-6">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-[8px] px-3 py-3 text-[15px] font-medium text-navy transition-colors hover:bg-ivory"
                >
                  {link.label}
                  <ChevronRight size={16} strokeWidth={1.6} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-charcoal/80">
            Categories
          </p>
          <ul className="flex flex-col gap-1">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  href={'/uniforms/' + category.slug}
                  onClick={onClose}
                  className="block rounded-[8px] px-3 py-2.5 text-[14px] text-charcoal transition-colors hover:bg-ivory hover:text-navy"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="shrink-0 space-y-3 border-t border-hairline px-5 py-5">
          <ButtonLink href="/quote" className="w-full" onClick={onClose}>
            Request a Quote
          </ButtonLink>
          <MobileAuthLinks onNavigate={onClose} />
        </div>
      </div>
    </>
  )
}
