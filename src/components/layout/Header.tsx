'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, Search, ShoppingBag } from 'lucide-react'

import { BRAND, NAV_LINKS } from '@/lib/site'
import { cn } from '@/lib/utils'
import { useQuote } from '@/components/quote/QuoteProvider'
import { SearchPanel } from '@/components/layout/SearchPanel'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { QuoteDrawer } from '@/components/quote/QuoteDrawer'

export function Header() {
  const pathname = usePathname()
  const { count, hydrated, openDrawer } = useQuote()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Close transient surfaces whenever the route changes.
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [pathname])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-hairline bg-white">
        <div className="shell flex h-16 items-center justify-between gap-4 md:h-[72px]">
          <div className="flex items-center gap-2 md:gap-10">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="-ml-2 flex h-10 w-10 items-center justify-center rounded-[6px] text-navy transition-colors hover:bg-ivory lg:hidden"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <Menu size={20} strokeWidth={1.6} aria-hidden="true" />
            </button>

            {/* TODO(owner): swap this wordmark for your logo file. */}
            <Link
              href="/"
              className="text-[15px] font-semibold uppercase tracking-[0.16em] text-navy transition-colors hover:text-burgundy md:text-[16px]"
            >
              {BRAND.name}
            </Link>

            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-8">
                {NAV_LINKS.map((link) => {
                  const active =
                    link.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(link.href)
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'relative py-2 text-[13.5px] font-medium transition-colors duration-200',
                          active
                            ? 'text-burgundy'
                            : 'text-navy hover:text-burgundy',
                        )}
                      >
                        {link.label}
                        <span
                          aria-hidden="true"
                          className={cn(
                            'absolute -bottom-[1px] left-0 h-[2px] w-full origin-left bg-burgundy transition-transform duration-200 ease-editorial',
                            active ? 'scale-x-100' : 'scale-x-0',
                          )}
                        />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-[6px] text-navy transition-colors hover:bg-ivory"
              aria-label="Search uniforms"
              aria-expanded={searchOpen}
            >
              <Search size={19} strokeWidth={1.6} aria-hidden="true" />
            </button>


            <button
              type="button"
              onClick={openDrawer}
              className="inline-flex h-10 items-center gap-2 rounded-[6px] border border-hairline bg-white px-3 text-[13px] font-medium text-navy transition-colors hover:border-navy md:px-4"
              aria-label={
                'Quote bag, ' + (hydrated ? count : 0) + ' item' + (count === 1 ? '' : 's')
              }
            >
              <ShoppingBag size={18} strokeWidth={1.6} aria-hidden="true" />
              <span className="hidden md:inline">Quote Bag</span>
              <span
                aria-hidden="true"
                className={cn(
                  'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums transition-colors',
                  hydrated && count > 0
                    ? 'bg-burgundy text-white'
                    : 'bg-ivory text-charcoal',
                )}
              >
                {hydrated ? count : 0}
              </span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
      <QuoteDrawer />
    </>
  )
}
