'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2, LogOut } from 'lucide-react'

import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/Button'

export function SignOutButton() {
  const { signOut } = useAuth()
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  return (
    <Button
      variant="secondary"
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        await signOut()
        router.push('/')
        router.refresh()
      }}
    >
      {busy ? (
        <>
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          Signing out
        </>
      ) : (
        <>
          <LogOut size={16} strokeWidth={1.7} aria-hidden="true" />
          Sign out
        </>
      )}
    </Button>
  )
}
