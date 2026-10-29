"use client"

import { useEffect, useRef } from "react"
import { Maximize2 } from "lucide-react"

type LazyDemoVideoProps = {
  src: string
  poster: string
  className?: string
}

type WebkitVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void }

// Muted autoplay loop that only starts downloading once the player nears the viewport,
// so the video never competes with the homepage's first paint. Clicking opens native
// fullscreen with sound and controls; leaving fullscreen restores the muted preview.
export function LazyDemoVideo({ src, poster, className }: LazyDemoVideoProps) {
  const videoRef = useRef<WebkitVideo>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (document.fullscreenElement === video) return
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { rootMargin: "200px 0px" },
    )

    const restorePreview = () => {
      video.muted = true
      video.controls = false
      video.play().catch(() => {})
    }
    const onFullscreenChange = () => {
      if (document.fullscreenElement !== video) restorePreview()
    }

    observer.observe(video)
    document.addEventListener("fullscreenchange", onFullscreenChange)
    // iOS Safari uses its own fullscreen player and fires this on the video instead.
    video.addEventListener("webkitendfullscreen", restorePreview)
    return () => {
      observer.disconnect()
      document.removeEventListener("fullscreenchange", onFullscreenChange)
      video.removeEventListener("webkitendfullscreen", restorePreview)
    }
  }, [])

  const openFullscreen = async () => {
    const video = videoRef.current
    if (!video) return

    video.muted = false
    video.controls = true
    video.currentTime = 0
    video.play().catch(() => {})

    try {
      if (video.requestFullscreen) {
        await video.requestFullscreen()
      } else {
        video.webkitEnterFullscreen?.()
      }
    } catch {
      video.muted = true
      video.controls = false
    }
  }

  return (
    <button
      type="button"
      onClick={openFullscreen}
      className="group relative block h-full w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
      aria-label="Play the CrossBorderIQ platform walkthrough fullscreen with sound"
    >
      <video
        ref={videoRef}
        className={className}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src={src} type="video/mp4" />
      </video>
      <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full border border-primary/30 bg-brand-navy/80 px-3 py-1.5 text-xs font-medium text-slate-100 opacity-90 backdrop-blur transition-opacity group-hover:opacity-100">
        <Maximize2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        Watch fullscreen
      </span>
    </button>
  )
}
