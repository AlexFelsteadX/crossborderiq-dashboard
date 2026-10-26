"use client"

import { useState, type FormEvent } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VENDOR_CATEGORIES } from "@/lib/vendor-categories"

type Status = "idle" | "submitting" | "success" | "error"

const inputClass =
  "w-full rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent"
const labelClass = "mb-1.5 block text-sm font-medium text-foreground"

export function SegmentSnapshotForm() {
  const [status, setStatus] = useState<Status>("idle")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    setStatus("submitting")
    try {
      const res = await fetch("/api/segment-snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json().catch(() => ({ ok: false }))
      setStatus(res.ok && json.ok ? "success" : "error")
      if (res.ok && json.ok) form.reset()
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-brand-teal" aria-hidden="true" />
        <p className="text-lg font-semibold text-foreground">
          Done. Your snapshot will be with you within two business days.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate={false}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="snap-name" className={labelClass}>
            Name
          </label>
          <input id="snap-name" name="name" required autoComplete="name" maxLength={200} className={inputClass} />
        </div>
        <div>
          <label htmlFor="snap-email" className={labelClass}>
            Work email
          </label>
          <input
            id="snap-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={200}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="snap-company" className={labelClass}>
            Company
          </label>
          <input
            id="snap-company"
            name="company"
            required
            autoComplete="organization"
            maxLength={200}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="snap-category" className={labelClass}>
            What do you provide?
          </label>
          <select id="snap-category" name="category" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Select a category
            </option>
            {VENDOR_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="snap-message" className={labelClass}>
          Message <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea id="snap-message" name="message" rows={3} maxLength={2000} className={inputClass} />
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="snap-website">Website</label>
        <input id="snap-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={status === "submitting"}
        className="h-12 self-start px-7 text-base bg-primary hover:bg-primary/90"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Sending
          </>
        ) : (
          "Request your segment snapshot"
        )}
      </Button>
      {status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {"Something went wrong sending your request. Please try again, or email crossborderiq@gemevents.co."}
        </p>
      )}
    </form>
  )
}
