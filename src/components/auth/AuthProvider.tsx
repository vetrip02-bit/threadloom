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
  currentLocalAccount,
  localLogIn,
  localLogOut,
  localSignUp,
  type AuthFailure,
  type LocalAccount,
  type LocalAccountProfile,
} from '@/lib/local-auth'
import type { Profile } from '@/types'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  /** False when this deployment has no Supabase project configured. */
  enabled: boolean
  signOut: () => Promise<void>

  /**
   * True when accounts are backed by this browser rather than Supabase.
   * Sign-up and log-in work either way; the UI discloses the difference.
   */
  localMode: boolean
  localAccount: LocalAccount | null
  signUpLocal: (input: {
    email: string
    password: string
    profile: LocalAccountProfile
  }) => Promise<{ ok: true } | { ok: false; reason: AuthFailure }>
  logInLocal: (
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; reason: AuthFailure }>

  /** True when somebody is signed in, from either backend. */
  signedIn: boolean
  /** Name to greet the customer with, from whichever source is in play. */
  displayName: string | null
  /** Email of the signed-in customer, from either backend. */
  email: string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [localAccount, setLocalAccount] = useState<LocalAccount | null>(null)
  const localMode = !ACCOUNTS_ENABLED

  // localStorage is only readable in the browser, so this runs after mount.
  useEffect(() => {
    if (localMode) {
      setLocalAccount(currentLocalAccount())
      setLoading(false)
    }
  }, [localMode])

  const signUpLocal = useCallback(
    async (input: {
      email: string
      password: string
      profile: LocalAccountProfile
    }) => {
      const result = await localSignUp(input)
      if (result.ok) setLocalAccount(result.account)
      return result.ok ? { ok: true as const } : { ok: false as const, reason: result.reason }
    },
    [],
  )

  const logInLocal = useCallback(async (email: string, password: string) => {
    const result = await localLogIn(email, password)
    if (result.ok) setLocalAccount(result.account)
    return result.ok ? { ok: true as const } : { ok: false as const, reason: result.reason }
  }, [])

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
    if (localMode) {
      localLogOut()
      setLocalAccount(null)
      return
    }
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [localMode])

  const signedIn = Boolean(user) || Boolean(localAccount)

  const displayName = user
    ? profile?.first_name?.trim() || user.email?.split('@')[0] || null
    : localAccount?.profile.firstName?.trim() ||
      localAccount?.email.split('@')[0] ||
      null

  const email = user?.email ?? localAccount?.email ?? null

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      enabled: ACCOUNTS_ENABLED,
      signOut,
      localMode,
      localAccount,
      signUpLocal,
      logInLocal,
      signedIn,
      displayName,
      email,
    }),
    [
      user,
      profile,
      loading,
      signOut,
      localMode,
      localAccount,
      signUpLocal,
      logInLocal,
      signedIn,
      displayName,
      email,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside an AuthProvider')
  return context
}
