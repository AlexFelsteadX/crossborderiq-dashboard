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

  // Claim any eligible, in-date trial grant for the signed-in email. The RPC is
  // idempotent (returns ok=false/'no_eligible_grant' when there is nothing to
  // claim), but we still guard with a per-session sessionStorage flag so it runs
  // at most once per browser session regardless of how many auth events fire.
  // Runs on EVERY authenticated session (not just the first sign-in), so grants
  // created after a member's first login (event batches, rep-link, pricing route)
  // are activated the next time they load an authenticated page.
  const maybeActivateTrial = useCallback(async () => {
    try {
      if (typeof window !== "undefined") {
        if (sessionStorage.getItem("cbiq_trial_activated") === "1") return
        sessionStorage.setItem("cbiq_trial_activated", "1")
      }
    } catch {
      // sessionStorage unavailable (private mode / SSR); still safe to attempt once
    }
    try {
      const { data, error } = await supabase.rpc('activate_trial')
      if (error) {
        console.log("[v0] activate_trial error:", error)
        return
      }
      // Tier is re-fetched by the caller after this resolves, so a successful
      // claim unlocks Premium immediately without a reload.
    } catch (err) {
      // never block auth on trial activation
      console.log("[v0] activate_trial exception:", err)
    }
  }, [supabase])

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      let tier: string | null = null
      if (user) {
        // Claim an eligible trial grant (once per session) before reading the
        // tier, so a fresh claim is reflected in the first tier value.
        await maybeActivateTrial()
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
          // Claim an eligible trial grant (once per session) before reading the
          // tier, so a fresh claim is reflected in the first tier value.
          await maybeActivateTrial()
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
  }, [supabase, fetchTier, maybeActivateTrial])

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
