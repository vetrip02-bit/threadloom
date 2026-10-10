import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { getAuthenticatedUser, getProfile } from '@/lib/supabase/server'
import { ACCOUNTS_ENABLED } from '@/lib/supabase/env'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { ButtonLink } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'My account',
  description: 'Your trade account profile.',
  alternates: { canonical: '/account' },
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  if (!ACCOUNTS_ENABLED) notFound()

  const user = await getAuthenticatedUser()
  if (!user) redirect('/signin?next=/account')

  const profile = await getProfile(user.id)

  const rows: Array<[string, string]> = [
    ['Name', [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || '—'],
    ['Business email', user.email ?? '—'],
    ['Phone', profile?.phone || '—'],
    ['Organization', profile?.organization || '—'],
    ['Customer type', profile?.customer_type || '—'],
    ['City', profile?.city || '—'],
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
            {!profile ? (
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
