"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mail, Lock, ArrowLeft, AlertCircle, CheckCircle, User, Eye, EyeOff } from "lucide-react"

function LoginForm() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<"signin" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "signin"
  )
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  // Check for error from auth callback
  const callbackError = searchParams.get("error")
  const nextUrl = searchParams.get("next")
  // Checkout intent: logged-out premium signups go straight to Stripe (no email round-trip)
  const intent = searchParams.get("intent")
  const intentTier = searchParams.get("tier")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (mode === "signup") {
      // Require a full name before creating the account
      const trimmedName = fullName.trim()
      if (!trimmedName) {
        setError("Please enter your full name.")
        setLoading(false)
        return
      }

      // Checkout-intent signup: create an email-confirmed account, establish a
      // session, and go straight to Stripe. Free/normal signup is left untouched below.
      if (intent === "checkout") {
        try {
          const res = await fetch("/api/signup-checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: trimmedName,
              email,
              password,
              tier: intentTier || "premium",
            }),
          })
          const data = await res.json()

          if (!res.ok || !data?.url) {
            if (data?.code === "user_exists") {
              setMode("signin")
            }
            setError(data?.error ? getErrorMessage(data.error) : "Could not start checkout. Please try again.")
            setLoading(false)
            return
          }

          // Redirect the browser to Stripe Checkout
          window.location.href = data.url
          return
        } catch {
          setError("Could not start checkout. Please try again.")
          setLoading(false)
          return
        }
      }

      // Create account - send the confirmation link straight to the final destination
      const redirectUrl = `${window.location.origin}${nextUrl || "/"}`
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: trimmedName },
          emailRedirectTo: redirectUrl,
        },
      })

      if (error) {
        setError(getErrorMessage(error.message))
      } else {
        setSuccess("Check your email and click the link to confirm your account.")
      }
    } else {
      // Sign in
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(getErrorMessage(error.message))
      } else {
        // Redirect to next param or home
        router.push(nextUrl || "/")
        router.refresh()
      }
    }

    setLoading(false)
  }

  // Passwordless sign-in: users who claimed a trial via a magic link never set a
  // password, so they need a link-based way back in. Login only (shouldCreateUser:
  // false) and routed through the standard /auth/callback so tier-based redirect applies.
  const handleMagicLink = async () => {
    setError(null)
    setSuccess(null)

    if (!email) {
      setError("Please enter your email address first.")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(getErrorMessage(error.message))
    } else {
      // Neutral message — never reveal whether an account exists for this email.
      setSuccess("If an account exists for that email, we've sent a sign-in link.")
    }

    setLoading(false)
  }

  const getErrorMessage = (message: string): string => {
    if (message.includes("Invalid login credentials")) {
      return "Invalid email or password. Please check your credentials and try again."
    }
    if (message.includes("Email not confirmed")) {
      return "Please confirm your email address before signing in. Check your inbox for the confirmation link."
    }
    if (message.includes("User already registered")) {
      return "An account with this email already exists. Try signing in instead."
    }
    if (message.includes("Password should be at least")) {
      return "Password must be at least 6 characters long."
    }
    return message
  }

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col relative">
      {/* Premium Dark Gradient Mesh Background - Same as homepage */}
      <div className="fixed inset-0 bg-brand-navy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_50%_30%_at_10%_80%,rgb(var(--brand-teal-deep-rgb)_/_0.1),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30 -z-10" />

      {/* Simple header */}
      <header className="px-6 py-4 max-w-[1600px] mx-auto w-full">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md p-8 rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.25)]">
          <div className="text-center mb-8">
            <Link href="/">
              <img 
                src="/cbiq-logo-lockup.svg" 
                alt="CBIQ" 
                className="h-8 w-auto mx-auto mb-6"
              />
            </Link>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-slate-400">
              {mode === "signin" 
                ? "Sign in to access your dashboards and intelligence." 
                : "Join CBIQ to access workforce intelligence."}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-lg border border-primary/20 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("signin")
                setError(null)
                setSuccess(null)
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === "signin"
                  ? "bg-primary text-primary-foreground"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              Sign in
            </button>
            {mode === "signin" ? (
              nextUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup")
                    setError(null)
                    setSuccess(null)
                  }}
                  className="flex-1 py-2 text-sm font-medium rounded-md transition-colors text-center text-slate-400 hover:text-slate-100"
                >
                  Create account
                </button>
              ) : (
                <span className="flex-1 py-2 text-sm font-medium text-center text-slate-400">
                  New here?{" "}
                  <Link
                    href="/pricing"
                    className="font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Get started →
                  </Link>
                </span>
              )
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode("signup")
                  setError(null)
                  setSuccess(null)
                }}
                className="flex-1 py-2 text-sm font-medium rounded-md transition-colors bg-primary text-primary-foreground"
              >
                Create account
              </button>
            )}
          </div>

          {/* Error from callback */}
          {callbackError && !error && !success && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                There was a problem confirming your account. Please try again or contact support.
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-500">{success}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Don&apos;t see the email? Check your spam or junk folder.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-200 mb-1.5">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Smith"
                    className="pl-10 bg-brand-navy/60 border-primary/20 text-slate-100 placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-primary"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="pl-10 bg-brand-navy/60 border-primary/20 text-slate-100 placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-primary"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-1.5">
                {mode === "signup" ? "Create password" : "Password"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "At least 6 characters" : "Enter your password"}
                  className="pl-10 pr-10 bg-brand-navy/60 border-primary/20 text-slate-100 placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-primary"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:text-primary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === "signin" && (
                <div className="mt-2 text-right">
                  <Link 
                    href="/forgot-password" 
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading 
                ? (mode === "signin" ? "Signing in..." : "Creating account...")
                : (mode === "signin" ? "Sign in" : "Create account")
              }
            </Button>

            {mode === "signin" && (
              <>
                <div className="flex items-center gap-3 py-1">
                  <span className="h-px flex-1 bg-primary/15" />
                  <span className="text-xs text-slate-500">or</span>
                  <span className="h-px flex-1 bg-primary/15" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleMagicLink}
                  disabled={loading}
                  className="w-full border-primary/30 bg-transparent text-slate-200 hover:bg-primary/10 hover:text-slate-100"
                >
                  <Mail className="h-4 w-4" />
                  Email me a sign-in link instead
                </Button>
                <p className="text-center text-xs text-slate-500">
                  No password needed — useful if you joined via an email link.
                </p>
              </>
            )}
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">Terms of Use</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </Card>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
