'use client'

import { AlertCircle, Mail, Phone } from 'lucide-react'

import { CONTACT, HAS_REAL_CONTACT_EMAIL } from '@/lib/site'

/**
 * Shown when an enquiry could not be delivered.
 *
 * The point is that the customer is never left at a dead end: if our mail
 * path is down, they still get the address and number to reach a human.
 */
export function DeliveryFallback({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-card border border-burgundy/35 bg-burgundy/5 p-5"
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          size={19}
          strokeWidth={1.8}
          className="mt-0.5 shrink-0 text-burgundy"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-navy">
            Your enquiry was not sent
          </p>
          <p className="mt-1.5 text-[13.5px] leading-6 text-charcoal">{message}</p>

          <ul className="mt-4 space-y-2.5">
            <li className="flex items-center gap-2.5">
              <Mail size={15} strokeWidth={1.7} className="shrink-0 text-burgundy" aria-hidden="true" />
              <a
                href={'mailto:' + CONTACT.email}
                className="break-all text-[13.5px] font-medium text-navy underline underline-offset-4 transition-colors hover:text-burgundy"
              >
                {CONTACT.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={15} strokeWidth={1.7} className="shrink-0 text-burgundy" aria-hidden="true" />
              <a
                href={'tel:' + CONTACT.phone}
                className="text-[13.5px] font-medium text-navy underline underline-offset-4 transition-colors hover:text-burgundy"
              >
                {CONTACT.phone}
              </a>
            </li>
          </ul>

          {!HAS_REAL_CONTACT_EMAIL ? (
            <p className="mt-4 border-t border-burgundy/20 pt-3 text-[12px] leading-5 text-charcoal">
              Site owner: these are still placeholders. Set
              {' '}
              <code className="rounded bg-white px-1 py-0.5 text-[11.5px]">
                NEXT_PUBLIC_CONTACT_EMAIL
              </code>{' '}
              and{' '}
              <code className="rounded bg-white px-1 py-0.5 text-[11.5px]">
                RESEND_API_KEY
              </code>
              , then redeploy.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
