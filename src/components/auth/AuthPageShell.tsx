import { notFound } from 'next/navigation'

import { ACCOUNTS_ENABLED } from '@/lib/supabase/env'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'

/**
 * Shared shell for /signin and /signup.
 *
 * When this deployment has no Supabase project, the auth pages 404 rather than
 * rendering a form that cannot possibly work.
 */
export function AuthPageShell({
  href,
  label,
  eyebrow,
  title,
  description,
  children,
}: {
  href: string
  label: string
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  if (!ACCOUNTS_ENABLED) notFound()

  return (
    <>
      <Breadcrumbs trail={[{ href: '/', label: 'Home' }, { href, label }]} />
      <div className="shell py-12 md:py-16">
        <div className="mx-auto max-w-[560px]">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 text-[28px] leading-tight md:text-[34px]">{title}</h1>
          <p className="mt-4 text-[14.5px] leading-7 text-charcoal">{description}</p>
          <div className="mt-9 rounded-card border border-hairline p-6 md:p-8">
            {children}
          </div>
          <p className="mt-6 text-center text-[13px] leading-6 text-charcoal">
            You can also request a quote without an account — an account just saves
            you retyping your details next time.
          </p>
        </div>
      </div>
    </>
  )
}
