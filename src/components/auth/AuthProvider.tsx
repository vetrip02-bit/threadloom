'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  configured: boolean
  signOut: () => Promise<void>
  /** Opens the sign-in / sign-up modal on desktop. */
  openAuthModal: (mode?: 'signin' | 'signup') => void
  closeAuthModal: () => void
  authModal: 'signin' | 'signup' | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Fires the server-side CRM sync once per session.
 *
 * The endpoint derives identity from the session cookie, so nothing
 * identifying is sent from here. A failure is swallowed deliberately: CRM sync
 * must never block or fail a sign-in.
 */
function useCrmSync(session: Session | null) {
  const syncedFor = useRef<string | null>(null)

  useEffect(() => {
    const userId = session?.user?.id
    if (!userId || syncedFor.current === userId) return
    syncedFor.current = userId

    const controller = new AbortController()
    fetch('/api/crm/sync-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      signal: controller.signal,
    }).catch(() => {
      // Intentionally ignored - sign-in has already succeeded.
    })

    return () => controller.abort()
  }, [session?.user?.id])
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [authModal, setAuthModal] = useState<'signin' | 'signup' | null>(null)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setLoading(false)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useCrmSync(session)

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      configured: isSupabaseConfigured,
      signOut,
      authModal,
      openAuthModal: (mode = 'signin') => setAuthModal(mode),
      closeAuthModal: () => setAuthModal(null),
    }),
    [session, loading, signOut, authModal],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside an AuthProvider')
  return context
}
