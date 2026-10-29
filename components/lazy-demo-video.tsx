"use client"

import { useEffect, useRef } from "react"

type LazyDemoVideoProps = {
  src: string
  poster: string
  className?: string
}

// Muted autoplay loop that only starts downloading once the player nears the viewport,
// so the video never competes with the homepage's first paint.
export function LazyDemoVideo({ src, poster, className }: LazyDemoVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { rootMargin: "200px 0px" },
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={videoRef}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label="CrossBorderIQ platform walkthrough"
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}
