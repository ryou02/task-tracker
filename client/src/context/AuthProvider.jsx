import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { supabase } from '../lib/supabase'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      const url = new URL(window.location.href)
      const authCode = url.searchParams.get('code')

      // OAuth providers (GitHub/Google) can redirect back with a code.
      // Exchange it before checking session so protected routes don't bounce.
      if (authCode) {
        await supabase.auth.exchangeCodeForSession(authCode)
        url.searchParams.delete('code')
        window.history.replaceState({}, '', url.toString())
      }

      const { data } = await supabase.auth.getSession()

      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signOut: () => supabase.auth.signOut(),
    }),
    [loading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }

  return context
}
