import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

import { AnnouncementBar } from '@/components/layout/AnnouncementBar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { QuoteProvider } from '@/components/quote/QuoteProvider'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { ALLOW_INDEXING, BRAND, CONTACT, SITE_URL } from '@/lib/site'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
  fallback: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: BRAND.name + ' — Wholesale Uniforms & Corporate Workwear',
    template: '%s | ' + BRAND.name,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: BRAND.name,
    title: BRAND.name + ' — ' + BRAND.tagline,
    description: BRAND.description,
    locale: 'en_IN',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: BRAND.name + ' — ' + BRAND.tagline,
    description: BRAND.description,
  },
  // Mirrors robots.ts: a placeholder deployment is noindex until the business
  // content is real and NEXT_PUBLIC_ALLOW_INDEXING=true is set.
  robots: {
    index: ALLOW_INDEXING,
    follow: ALLOW_INDEXING,
  },
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
}

/**
 * Organization JSON-LD. Only fields we actually display are emitted, so the
 * markup never asserts something the page does not show.
 */
function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND.name,
    slogan: BRAND.tagline,
    description: BRAND.description,
    url: SITE_URL,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: CONTACT.email,
        telephone: CONTACT.phone,
        areaServed: 'IN',
        availableLanguage: ['en'],
      },
    ],
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={poppins.variable}>
      <body className="bg-white font-sans text-[15px] leading-relaxed text-charcoal antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <AuthProvider>
          <QuoteProvider>
          <a href="#main" className="skip-link">
            Skip to main content
          </a>
          <AnnouncementBar />
          <Header />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          </QuoteProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
