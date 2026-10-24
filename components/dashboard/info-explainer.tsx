"use client"

import type React from "react"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Info } from "lucide-react"

// Info-icon explainer. Opens on hover (desktop) or tap (mobile), portalled to
// <body> with edge-flipping placement, and closes on a second tap, an outside
// tap, or Escape.
export function InfoExplainer({ label, children }: { label: string; children: React.ReactNode }) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  const [pinned, setPinned] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const panelId = useRef(`info-${Math.random().toString(36).slice(2, 9)}`).current

  const open = useCallback(() => {
    if (triggerRef.current) setAnchor(triggerRef.current.getBoundingClientRect())
  }, [])
  const close = useCallback(() => {
    setAnchor(null)
    setPinned(false)
    setPos(null)
  }, [])

  useLayoutEffect(() => {
    const el = panelRef.current
    if (!anchor || !el) return
    const gap = 8
    const edge = 8
    const { width, height } = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    let top = anchor.bottom + gap
    if (top + height > vh - edge) top = anchor.top - height - gap
    top = Math.max(edge, Math.min(top, vh - height - edge))
    const left = Math.max(edge, Math.min(anchor.left + anchor.width / 2 - width / 2, vw - width - edge))
    setPos({ top, left })
  }, [anchor])

  useEffect(() => {
    if (!anchor) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return
      close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    const onScroll = () => close()
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    window.addEventListener("scroll", onScroll, true)
    window.addEventListener("resize", onScroll)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("resize", onScroll)
    }
  }, [anchor, close])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={!!anchor}
        aria-controls={anchor ? panelId : undefined}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") open()
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse" && !pinned) close()
        }}
        onFocus={open}
        onBlur={() => {
          if (!pinned) close()
        }}
        onClick={() => {
          if (pinned) close()
          else {
            open()
            setPinned(true)
          }
        }}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-500 hover:text-slate-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
      >
        <Info className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      {anchor &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label={label}
            style={{ position: "fixed", top: pos?.top ?? 0, left: pos?.left ?? 0, visibility: pos ? "visible" : "hidden" }}
            className="z-[100] w-[min(22rem,calc(100vw-16px))] rounded-lg border border-primary/30 bg-brand-navy-3 p-3 shadow-xl"
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  )
}
