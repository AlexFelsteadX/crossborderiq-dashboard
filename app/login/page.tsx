"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mail, ArrowLeft, AlertCircle, CheckCircle, KeyRound } from "lucide-react"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  // One-time-code (OTP) sign-in state — runs alongside the magic link.
  const [code, setCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const supabase = createClient()

  // Shared sign-in email send. Sends both the magic link and the 6-digit code
  // (governed by the Supabase email template). Returns true on success.
  const sendSignInEmail = async (trimmedEmail: string) => {
    return supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/`,
      },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError("Please enter your email address.")
      return
    }

    setLoading(true)

    const { error } = await sendSignInEmail(trimmedEmail)

    if (error) {
      setError(error.message || "Something went wrong. Please try again.")
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  const cleanedCode = code.replace(/[\s-]/g, "").trim()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifyError(null)

    if (cleanedCode.length !== 6) return

    setVerifying(true)

    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: cleanedCode,
      type: "email",
    })

    if (error) {
      setVerifyError("That code is not valid or has expired. Request a new one below.")
      setVerifying(false)
      return
    }

    // Success: the browser Supabase client (via @supabase/ssr) has written the
    // session to cookies. Hand off to the existing server callback route, which
    // detects the session, runs activate_trial(), and redirects — exactly the
    // same post-authentication path the magic link uses. No duplicated logic.
    // Keep `verifying` true so the button stays in its loading state until the
    // full-page navigation takes over.
    window.location.href = "/auth/callback?next=/"
  }

  const handleResend = async () => {
    setResent(false)
    setVerifyError(null)
    setError(null)
    setCode("")

    const trimmedEmail = email.trim()
    if (!trimmedEmail) return

    setResending(true)
    const { error } = await sendSignInEmail(trimmedEmail)
    setResending(false)

    if (error) {
      setVerifyError("Something went wrong. Please try again.")
      return
    }
    setResent(true)
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
            {sent ? (
              <>
                <h1 className="text-2xl font-bold text-slate-100 mb-2">Check your email</h1>
                <p className="text-sm text-slate-400">
                  We&apos;ve sent your sign in link.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-slate-100 mb-2">Get access to CBIQ</h1>
                <p className="text-sm text-slate-400">
                  Enter your email and we&apos;ll send you a secure sign-in link.
                </p>
              </>
            )}
          </div>

          {sent ? (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-100">Check your email for your sign in link.</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Sent to {email.trim()}. Don&apos;t see it? Check your spam or junk folder.
                  </p>
                </div>
              </div>

              {/* One-time code sign-in — an alternative to clicking the magic link */}
              <div className="pt-2 border-t border-primary/10">
                <p className="text-xs text-slate-500 mb-3 text-center">
                  Prefer to enter a code? Use the one from the same email.
                </p>

                {verifyError && (
                  <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{verifyError}</p>
                  </div>
                )}

                {resent && !verifyError && (
                  <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-200">A new code is on its way. Check your email.</p>
                  </div>
                )}

                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-slate-200 mb-1.5">
                      Enter the 6 digit code from your email
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        id="code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                        placeholder="123456"
                        className="pl-10 tracking-[0.4em] bg-brand-navy/60 border-primary/20 text-slate-100 placeholder:text-slate-500 placeholder:tracking-normal focus-visible:ring-primary focus-visible:border-primary"
                        disabled={verifying}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={verifying || cleanedCode.length !== 6}
                  >
                    {verifying ? "Verifying..." : "Verify"}
                  </Button>
                </form>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || verifying}
                  className="mt-3 w-full text-center text-xs text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-60"
                >
                  {resending ? "Sending a new code..." : "Send a new code"}
                </button>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSent(false)
                  setError(null)
                  setCode("")
                  setVerifyError(null)
                  setResent(false)
                }}
                className="w-full border-primary/30 bg-transparent text-slate-200 hover:bg-primary/10 hover:text-slate-100"
              >
                Use a different email
              </Button>
            </div>
          ) : (
            <>
              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? "Sending link..." : "Email me a sign in link"}
                </Button>
              </form>
            </>
          )}

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
