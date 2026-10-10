'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import { useAuth } from '@/components/auth/AuthProvider'
import { SignInForm } from '@/components/auth/SignInForm'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { Scrim, useModalBehaviour } from '@/components/ui/Overlay'

/**
 * Desktop/tablet auth surface.
 *
 * Below the `md` breakpoint the modal is not rendered at all - the header's
 * mobile menu links to the full /signin and /signup pages instead, which is
 * the better small-screen experience.
 */
export function AuthModal() {
  const { authModal, closeAuthModal, openAuthModal } = useAuth()
  const [isDesktop, setIsDesktop] = useState(false)
  const open = authModal !== null && isDesktop
  const containerRef = useModalBehaviour(open, closeAuthModal)

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)')
    const sync = () => setIsDesktop(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  if (!open) return null

  const isSignUp = authModal === 'signup'

  return (
    <>
      <Scrim onClick={closeAuthModal} />
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-6 md:p-10">
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          tabIndex={-1}
          className="relative w-full max-w-[520px] animate-fade-up rounded-card border border-hairline bg-white p-7 shadow-lifted md:p-9"
        >
          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-[6px] text-navy transition-colors hover:bg-ivory"
          >
            <X size={19} strokeWidth={1.7} aria-hidden="true" />
          </button>

          <p className="eyebrow">{isSignUp ? 'Create account' : 'Welcome back'}</p>
          <h2 id="auth-modal-title" className="mb-6 mt-3 text-[24px] leading-tight">
            {isSignUp ? 'Set up your trade account' : 'Sign in to your account'}
          </h2>

          {isSignUp ? (
            <SignUpForm
              onSuccess={closeAuthModal}
              onSwitch={() => openAuthModal('signin')}
            />
          ) : (
            <SignInForm
              onSuccess={closeAuthModal}
              onSwitch={() => openAuthModal('signup')}
            />
          )}
        </div>
      </div>
    </>
  )
}
