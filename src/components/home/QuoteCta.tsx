import { ArrowRight } from 'lucide-react'

import { ButtonLink } from '@/components/ui/Button'
import { CONTACT } from '@/lib/site'

export function QuoteCta() {
  return (
    <section className="border-t border-hairline bg-white">
      <div className="shell py-16 md:py-20">
        <div className="flex flex-col items-start gap-8 rounded-card border border-hairline bg-ivory px-7 py-10 md:flex-row md:items-center md:justify-between md:px-12 md:py-12">
          <div className="max-w-xl">
            <h2 className="text-[24px] leading-tight md:text-[30px]">
              Tell us what your team needs to wear
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-charcoal">
              Share roles, rough quantities and the date you need stock by. We reply
              with options and a written quote - no payment is taken on this site.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ButtonLink href="/quote" size="lg">
              Request a Quote
              <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
            </ButtonLink>
            {/* TODO(owner): replace the placeholder phone number in src/lib/site.ts */}
            <ButtonLink href={'tel:' + CONTACT.phone} variant="secondary" size="lg">
              Call {CONTACT.phone}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}
