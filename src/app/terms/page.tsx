import type { Metadata } from 'next'
import Link from 'next/link'

import { BRAND, CONTACT } from '@/lib/site'
import { LegalPage } from '@/components/ui/LegalPage'

export const metadata: Metadata = {
  title: 'Terms of use',
  description:
    'The terms that apply to this website, quote enquiries and wholesale orders.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <LegalPage
      href="/terms"
      label="Terms of use"
      title="Terms of use"
      description={'The terms on which ' + BRAND.name + ' provides this website.'}
      updated="[DD Month YYYY]"
    >
      <section>
        <h2>This site does not sell</h2>
        <p>
          Nothing on this website is an offer to sell. Adding items to a quote bag and
          submitting an enquiry creates no contract and reserves no stock. An order
          exists only once we issue a written quote or proforma invoice and you accept
          it in writing.
        </p>
      </section>

      <section>
        <h2>Prices</h2>
        <p>
          Any price band shown here is indicative, exclusive of GST, and subject to
          change. Final pricing depends on fabric, quantity, branding method, artwork
          complexity and delivery location, and is confirmed only in a written quote.
        </p>
      </section>

      <section>
        <h2>Samples and approvals</h2>
        <p>
          Where a sample is produced, your written approval of that sample is the
          reference for bulk production. Minor variation in shade, trim and measurement
          between a sample and a bulk run is normal in garment manufacturing; tolerances
          are stated in the quote.
        </p>
      </section>

      <section>
        <h2>Your artwork</h2>
        <p>
          By sending us a logo, crest, name or other artwork you confirm you have the
          right to use it and to have it applied to garments. We do not verify
          ownership of submitted artwork.
        </p>
      </section>

      <section>
        <h2>Minimum order quantities</h2>
        <p>
          Minimum order quantities shown against sample products are indicative and may
          vary by fabric, colour and branding method.
        </p>
      </section>

      <section>
        <h2>Accounts</h2>
        <p>
          You are responsible for keeping your account credentials secure and for
          activity under your account. Tell us at{' '}
          <a
            href={'mailto:' + CONTACT.email}
            className="font-medium text-burgundy underline underline-offset-4"
          >
            {CONTACT.email}
          </a>{' '}
          if you believe your account has been accessed without your permission.
        </p>
      </section>

      <section>
        <h2>Site content</h2>
        <p>
          Product descriptions, specifications and imagery on this site are provided for
          guidance. We may change or withdraw any part of the site without notice.
        </p>
      </section>

      <section>
        <h2>Governing law</h2>
        <p>
          {/* TODO(owner): confirm the jurisdiction with your legal adviser. */}
          These terms are governed by the laws of India, with exclusive jurisdiction in
          the courts of <strong className="text-navy">[your city]</strong>.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms can go to our{' '}
          <Link href="/contact" className="font-medium text-burgundy underline underline-offset-4">
            contact page
          </Link>
          . See also our{' '}
          <Link href="/privacy" className="font-medium text-burgundy underline underline-offset-4">
            privacy policy
          </Link>
          .
        </p>
      </section>
    </LegalPage>
  )
}
