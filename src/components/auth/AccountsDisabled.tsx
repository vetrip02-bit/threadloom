import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'

/**
 * Shown at /signin and /signup when this build has no Supabase project.
 *
 * Deliberately NOT `notFound()`: under `output: 'export'` a notFound() during
 * prerender still emits an HTML file, so the host serves the not-found UI with
 * a 200 — a soft 404 that lies about the status. The route genuinely exists
 * here, so it explains itself instead. Nobody arrives by accident: the header
 * Log in / Sign up buttons are not rendered at all when accounts are off.
 */
export function AccountsDisabled() {
  return (
    <>
      <PageHeader
        eyebrow="Accounts"
        title="Accounts are not enabled on this site"
        description="This deployment has no account system configured, so there is nothing to log in to. You can still request a quote — an account only saves you retyping your details."
      />
      <Section>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/quote">Request a quote</ButtonLink>
          <ButtonLink href="/uniforms" variant="secondary">
            Browse uniforms
          </ButtonLink>
        </div>
      </Section>
    </>
  )
}
