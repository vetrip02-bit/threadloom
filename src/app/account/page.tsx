import type { Metadata } from 'next'

import { AccountView } from '@/components/auth/AccountView'

export const metadata: Metadata = {
  title: 'My account',
  description: 'Your trade account profile.',
  alternates: { canonical: '/account' },
  robots: { index: false, follow: false },
}

export default function AccountPage() {
  return <AccountView />
}
