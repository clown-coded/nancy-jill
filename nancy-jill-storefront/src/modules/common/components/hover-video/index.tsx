"use client"

import { useRef } from "react"

type HoverVideoProps = {
  src: string
  className?: string
}

export default function HoverVideo({ src, className }: HoverVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)

  const play = () => {
    const el = ref.current
    if (!el) return
    el.play().catch(() => {})
  }

  const pause = () => {
    const el = ref.current
    if (!el) return
    el.pause()
  }

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      className={`${className ?? ""} opacity-75 hover:opacity-100 transition-opacity`}
      onMouseEnter={play}
      onMouseLeave={pause}
      onTouchStart={play}
      onTouchEnd={pause}
    />
  )
}
