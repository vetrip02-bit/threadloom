import type { Metadata } from 'next'

import { MyDetailsView } from '@/components/auth/MyDetailsView'

export const metadata: Metadata = {
  title: 'My details',
  description:
    'Save your contact details on this device so quote requests are filled in for you.',
  alternates: { canonical: '/my-details' },
  robots: { index: false, follow: true },
}

export default function MyDetailsPage() {
  return <MyDetailsView />
}
