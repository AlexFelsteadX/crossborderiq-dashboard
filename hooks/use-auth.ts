"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AuthState {
  user: User | null
  tier: string | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    tier: null,
    loading: true,
  })
  
  const supabase = createClient()

  const fetchTier = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('current_tier')
      if (error) {
        console.log("[v0] Error fetching tier:", error)
        return null
      }
      return data as string | null
    } catch {
      return null
    }
  }, [supabase])

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      let tier: string | null = null
      if (user) {
        tier = await fetchTier(user.id)
      }
      
      setState({
        user,
        tier,
        loading: false,
      })
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null
        let tier: string | null = null
        
        if (user) {
          tier = await fetchTier(user.id)
        }
        
        setState({
          user,
          tier,
          loading: false,
        })
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchTier])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return {
    user: state.user,
    tier: state.tier,
    loading: state.loading,
    signOut,
  }
}
