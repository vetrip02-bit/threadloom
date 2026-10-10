import type { Metadata } from 'next'
import Link from 'next/link'

import { BRAND, CONTACT } from '@/lib/site'
import { LegalPage } from '@/components/ui/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy policy',
  description:
    'How we collect, use and store the personal data you provide through enquiries and trade accounts.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <LegalPage
      href="/privacy"
      label="Privacy policy"
      title="Privacy policy"
      description={'How ' + BRAND.name + ' handles the information you share with us.'}
      updated="[DD Month YYYY]"
    >
      <section>
        <h2>What we collect</h2>
        <p>
          We collect only what we need to respond to a business enquiry and to run a
          trade account:
        </p>
        <ul>
          <li>Your name, organization, business email, phone number and city.</li>
          <li>The customer type you select when creating an account.</li>
          <li>
            The details of your enquiry: garments, quantities, sizes, colours, branding
            preferences, notes and any expected delivery date.
          </li>
          <li>
            A record that you gave consent, and when, so we can evidence the basis on
            which we hold your details.
          </li>
        </ul>
      </section>

      <section>
        <h2>Passwords</h2>
        <p>
          Account passwords are handled entirely by our authentication provider
          (Supabase Auth) and are stored by them in hashed form. We do not see, store,
          log or transmit your password, and it is never sent to our CRM or to any
          other third party.
        </p>
      </section>

      <section>
        <h2>Why we hold it</h2>
        <p>
          To prepare and send quotes, to produce and deliver orders, to keep a record
          of what was approved for repeat orders, and to meet tax and accounting
          obligations.
        </p>
      </section>

      <section>
        <h2>Who we share it with</h2>
        <p>
          Your contact details and enquiry summary are stored in our customer
          relationship management system (Zoho CRM) so the sales team can respond and
          keep a history of the conversation. We also use a hosting provider and an
          authentication provider to run this website. We do not sell your data, and we
          do not share it for advertising.
        </p>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <p>
          {/* TODO(owner): state your actual retention period. */}
          Enquiry and account records are retained for{' '}
          <strong className="text-navy">[retention period — e.g. 36 months]</strong>{' '}
          from your last interaction with us, unless a longer period is required for
          tax or legal reasons.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can ask us to show you what we hold, correct it, or delete it. Write to{' '}
          <a
            href={'mailto:' + CONTACT.email}
            className="font-medium text-burgundy underline underline-offset-4"
          >
            {CONTACT.email}
          </a>{' '}
          from your registered address and we will respond. Deleting your details may
          mean we can no longer service an open enquiry or order.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          This site sets a session cookie when you sign in, which is required for the
          account area to work. Your quote bag is stored in your own browser&rsquo;s
          local storage and is not transmitted to us until you submit an enquiry.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about this policy can go to{' '}
          <a
            href={'mailto:' + CONTACT.email}
            className="font-medium text-burgundy underline underline-offset-4"
          >
            {CONTACT.email}
          </a>
          , or see our{' '}
          <Link href="/contact" className="font-medium text-burgundy underline underline-offset-4">
            contact page
          </Link>
          .
        </p>
      </section>
    </LegalPage>
  )
}
