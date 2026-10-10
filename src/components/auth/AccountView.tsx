'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

import { useAuth } from '@/components/auth/AuthProvider'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { ButtonLink } from '@/components/ui/Button'

/**
 * Client-side account page.
 *
 * On a static host there is no middleware and no server session, so the guard
 * runs here. The data behind it is still protected: Supabase Row Level
 * Security means a profile row can only ever be read by its owner, whatever
 * the browser does.
 */
export function AccountView() {
  const { user, profile, localAccount, signedIn, email, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !signedIn) router.replace('/signin?next=/account')
  }, [loading, signedIn, router])

  if (loading || !signedIn) {
    return (
      <div className="shell flex min-h-[50vh] items-center justify-center py-20">
        <p className="flex items-center gap-3 text-[14px] text-charcoal">
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          Loading your account…
        </p>
      </div>
    )
  }

  // Whichever backend is in play, the same six rows are shown.
  const p = user
    ? {
        firstName: profile?.first_name,
        lastName: profile?.last_name,
        phone: profile?.phone,
        organization: profile?.organization,
        customerType: profile?.customer_type,
        city: profile?.city,
      }
    : localAccount?.profile

  const rows: Array<[string, string]> = [
    ['Name', [p?.firstName, p?.lastName].filter(Boolean).join(' ') || '—'],
    ['Business email', email ?? '—'],
    ['Phone', p?.phone || '—'],
    ['Organization', p?.organization || '—'],
    ['Customer type', p?.customerType || '—'],
    ['City', p?.city || '—'],
  ]

  return (
    <>
      <Breadcrumbs
        trail={[{ href: '/', label: 'Home' }, { href: '/account', label: 'Account' }]}
      />
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="These details are filled in automatically every time you request a quote, so you never type them twice."
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)] lg:gap-12">
          <div className="rounded-card border border-hairline p-6 md:p-8">
            <h2 className="text-[17px] font-semibold text-navy">Profile details</h2>
            <dl className="mt-6 divide-y divide-hairline border-y border-hairline">
              {rows.map(([label, value]) => (
                <div key={label} className="flex flex-wrap gap-2 py-4">
                  <dt className="w-44 shrink-0 text-[13px] text-charcoal/80">{label}</dt>
                  <dd className="text-[14px] font-medium text-navy">{value}</dd>
                </div>
              ))}
            </dl>
            {user && !profile ? (
              <p className="mt-5 text-[13px] leading-6 text-charcoal">
                We could not load a profile row for this account. If you have just
                signed up, confirm your email address and log in again.
              </p>
            ) : null}
            <p className="mt-5 text-[12.5px] leading-6 text-charcoal/80">
              You can change any of these on a quote request by choosing
              &ldquo;Edit&rdquo;. Passwords are managed by our authentication
              provider and are never visible to us.
            </p>
          </div>

          <aside className="space-y-4">
            <div className="rounded-card border border-hairline p-6">
              <h2 className="text-[16px] font-semibold text-navy">Quick actions</h2>
              <div className="mt-5 flex flex-col gap-3">
                <ButtonLink href="/quote">Request a quote</ButtonLink>
                <ButtonLink href="/uniforms" variant="ghost">
                  Browse uniforms
                </ButtonLink>
                <SignOutButton />
              </div>
            </div>
            <div className="rounded-card border border-hairline bg-ivory p-6">
              <h2 className="text-[15px] font-semibold text-navy">Your data</h2>
              <p className="mt-2 text-[13px] leading-6 text-charcoal">
                Read how we handle your details in our{' '}
                <Link
                  href="/privacy"
                  className="font-medium text-burgundy underline underline-offset-4"
                >
                  privacy policy
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  )
}
