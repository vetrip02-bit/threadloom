'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/components/auth/AuthProvider'
import { MyDetailsForm } from '@/components/auth/MyDetailsForm'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { PageHeader } from '@/components/ui/PageHeader'

export function MyDetailsView() {
  const { enabled } = useAuth()
  const router = useRouter()

  // If real accounts are switched on, this page is redundant - send people to
  // the account system instead of maintaining two competing identities.
  useEffect(() => {
    if (enabled) router.replace('/signup')
  }, [enabled, router])

  if (enabled) return null

  return (
    <>
      <Breadcrumbs
        trail={[{ href: '/', label: 'Home' }, { href: '/my-details', label: 'My details' }]}
      />
      <PageHeader
        eyebrow="Save time on quotes"
        title="My details"
        description="Fill this in once and every quote request is completed for you. No password, no account — the details stay in this browser."
      />
      <div className="shell pb-16 md:pb-20">
        <div className="max-w-[640px]">
          <MyDetailsForm />
        </div>
      </div>
    </>
  )
}
