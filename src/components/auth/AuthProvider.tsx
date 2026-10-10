'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { ACCOUNTS_ENABLED } from '@/lib/supabase/env'
import {
  clearLocalProfile,
  isLocalProfileComplete,
  readLocalProfile,
  type LocalProfile,
} from '@/lib/local-profile'
import type { Profile } from '@/types'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  /** False when this deployment has no Supabase project configured. */
  enabled: boolean
  signOut: () => Promise<void>

  /**
   * Device-local details, used only when `enabled` is false. Not an account:
   * no password, no server, this browser only.
   */
  localProfile: LocalProfile | null
  localProfileComplete: boolean
  refreshLocalProfile: () => void
  forgetLocalProfile: () => void

  /** Name to greet the customer with, from whichever source is in play. */
  displayName: string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [localProfile, setLocalProfile] = useState<LocalProfile | null>(null)

  const refreshLocalProfile = useCallback(() => {
    setLocalProfile(readLocalProfile())
  }, [])

  const forgetLocalProfile = useCallback(() => {
    clearLocalProfile()
    setLocalProfile(null)
  }, [])

  // localStorage is only readable in the browser, so this runs after mount.
  useEffect(() => {
    refreshLocalProfile()
    if (!ACCOUNTS_ENABLED) setLoading(false)
  }, [refreshLocalProfile])

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    let active = true

    /** Loads the profile row so the quote form can prefill from it. */
    async function loadProfile(nextUser: User | null) {
      if (!nextUser) {
        setProfile(null)
        return
      }
      const { data } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', nextUser.id)
        .maybeSingle()
      if (active) setProfile((data as Profile) ?? null)
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      const nextUser = data.session?.user ?? null
      setUser(nextUser)
      await loadProfile(nextUser)
      if (active) setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session: Session | null) => {
        const nextUser = session?.user ?? null
        setUser(nextUser)
        void loadProfile(nextUser)
        setLoading(false)
      },
    )

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [])

  const displayName = user
    ? profile?.first_name?.trim() || user.email?.split('@')[0] || null
    : localProfile?.firstName?.trim() || null

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      enabled: ACCOUNTS_ENABLED,
      signOut,
      localProfile,
      localProfileComplete: isLocalProfileComplete(localProfile),
      refreshLocalProfile,
      forgetLocalProfile,
      displayName,
    }),
    [
      user,
      profile,
      loading,
      signOut,
      localProfile,
      refreshLocalProfile,
      forgetLocalProfile,
      displayName,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside an AuthProvider')
  return context
}
