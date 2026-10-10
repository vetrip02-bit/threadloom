'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, LogOut, User } from 'lucide-react'

import { useAuth } from '@/components/auth/AuthProvider'
import { cn } from '@/lib/utils'

/**
 * The page to come back to after logging in.
 *
 * Deliberately uses `usePathname` only, NOT `useSearchParams`: the latter
 * forces every page that renders the header out of static generation and into
 * a Suspense bailout. No route on this site carries meaningful query state.
 */
export function useReturnTo(): string {
  const pathname = usePathname()
  // Never ask to be returned to an auth page.
  return /^\/(signin|signup)/.test(pathname) ? '/' : pathname
}

export function HeaderAuth() {
  const { user, loading, enabled, signOut, displayName, forgetLocalProfile } =
    useAuth()
  const returnTo = useReturnTo()
  const [menuOpen, setMenuOpen] = useState(false)

  // Hold the space while state resolves, so the header does not jump.
  if (loading) {
    return (
      <div
        aria-hidden="true"
        className="hidden h-10 w-[150px] animate-pulse rounded-[6px] bg-ivory md:block"
      />
    )
  }

  /*
   * No Supabase project on this deployment. Rather than hiding the control
   * entirely, offer the device-local alternative - visible and useful, and
   * honestly labelled: it saves details to this browser, it is not a login.
   */
  if (!enabled) {
    if (displayName) {
      return (
        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="inline-flex h-10 max-w-[180px] items-center gap-2 rounded-[6px] px-3 text-[13px] font-medium text-navy transition-colors hover:bg-ivory"
          >
            <User size={17} strokeWidth={1.7} aria-hidden="true" />
            <span className="truncate">{displayName}</span>
            <ChevronDown
              size={14}
              strokeWidth={2}
              aria-hidden="true"
              className={cn('transition-transform duration-200', menuOpen && 'rotate-180')}
            />
          </button>

          {menuOpen ? (
            <>
              <div
                className="fixed inset-0 z-40"
                aria-hidden="true"
                onClick={() => setMenuOpen(false)}
              />
              <div
                role="menu"
                className="absolute right-0 top-12 z-50 w-60 animate-fade-up rounded-card border border-hairline bg-white p-1.5 shadow-lifted"
              >
                <p className="px-3 py-2 text-[12px] leading-5 text-charcoal/80">
                  Saved on this device only
                </p>
                <Link
                  href="/my-details"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-[6px] px-3 py-2.5 text-[13.5px] text-navy transition-colors hover:bg-ivory"
                >
                  Edit my details
                </Link>
                <Link
                  href="/quote"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-[6px] px-3 py-2.5 text-[13.5px] text-navy transition-colors hover:bg-ivory"
                >
                  Request a quote
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    forgetLocalProfile()
                  }}
                  className="flex w-full items-center gap-2 rounded-[6px] border-t border-hairline px-3 py-2.5 text-left text-[13.5px] text-navy transition-colors hover:bg-ivory"
                >
                  <LogOut size={15} strokeWidth={1.7} aria-hidden="true" />
                  Forget my details
                </button>
              </div>
            </>
          ) : null}
        </div>
      )
    }

    return (
      <Link
        href="/my-details"
        className="hidden h-10 items-center gap-2 rounded-[6px] border border-navy px-4 text-[13px] font-medium text-navy transition-colors hover:bg-navy hover:text-white md:inline-flex"
      >
        <User size={16} strokeWidth={1.7} aria-hidden="true" />
        Save my details
      </Link>
    )
  }

  if (!user) {
    const next = '?next=' + encodeURIComponent(returnTo)
    return (
      <div className="hidden items-center gap-1.5 md:flex">
        <Link
          href={'/signin' + next}
          className="inline-flex h-10 items-center rounded-[6px] px-3 text-[13px] font-medium text-navy transition-colors hover:bg-ivory"
        >
          Log in
        </Link>
        <Link
          href={'/signup' + next}
          className="inline-flex h-10 items-center rounded-[6px] border border-navy px-4 text-[13px] font-medium text-navy transition-colors hover:bg-navy hover:text-white"
        >
          Sign up
        </Link>
      </div>
    )
  }

  return (
    <div className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        className="inline-flex h-10 max-w-[180px] items-center gap-2 rounded-[6px] px-3 text-[13px] font-medium text-navy transition-colors hover:bg-ivory"
      >
        <User size={17} strokeWidth={1.7} aria-hidden="true" />
        <span className="truncate">{displayName}</span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          aria-hidden="true"
          className={cn('transition-transform duration-200', menuOpen && 'rotate-180')}
        />
      </button>

      {menuOpen ? (
        <>
          {/* Click-away layer. */}
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 top-12 z-50 w-56 animate-fade-up rounded-card border border-hairline bg-white p-1.5 shadow-lifted"
          >
            <p className="truncate px-3 py-2 text-[12px] text-charcoal/80">
              {user.email}
            </p>
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="block rounded-[6px] px-3 py-2.5 text-[13.5px] text-navy transition-colors hover:bg-ivory"
            >
              My account
            </Link>
            <Link
              href="/quote"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="block rounded-[6px] px-3 py-2.5 text-[13.5px] text-navy transition-colors hover:bg-ivory"
            >
              Request a quote
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={async () => {
                setMenuOpen(false)
                await signOut()
              }}
              className="flex w-full items-center gap-2 rounded-[6px] border-t border-hairline px-3 py-2.5 text-left text-[13.5px] text-navy transition-colors hover:bg-ivory"
            >
              <LogOut size={15} strokeWidth={1.7} aria-hidden="true" />
              Log out
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}
