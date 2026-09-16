"use client"

import { useEffect, useState } from "react"

const DOT = 6
const FRAME = 18

export default function ScrollDot() {
  const [progress, setProgress] = useState<number | null>(null)

  useEffect(() => {
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (scrollable <= DOT) {
        setProgress(null)
        return
      }

      // Pinned sections scroll without moving anything on screen, so drop that
      // distance from both the travelled and the total: the dot holds still
      // while a section is stuck and only moves when the page visibly moves.
      let stuck = 0
      let stuckPassed = 0
      document.querySelectorAll<HTMLElement>(".sticky").forEach((child) => {
        const wrapper = child.parentElement
        if (!wrapper) return
        const length = wrapper.offsetHeight - child.offsetHeight
        if (length <= 0) return
        stuck += length
        const top = wrapper.getBoundingClientRect().top + window.scrollY
        stuckPassed += Math.min(length, Math.max(0, window.scrollY - top))
      })

      const travelled = window.scrollY - stuckPassed
      const total = scrollable - stuck
      setProgress(total <= 0 ? 0 : Math.min(1, Math.max(0, travelled / total)))
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    // Pages grow as sticky sections and images settle
    const observer = new ResizeObserver(update)
    observer.observe(document.body)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      observer.disconnect()
    }
  }, [])

  if (progress === null) {
    return null
  }

  return (
    <div
      aria-hidden
      className="hidden small:block pointer-events-none fixed z-30 rounded-full bg-nj-main"
      style={{
        width: DOT,
        height: DOT,
        // centred in the gutter between the two middle guides
        left: `calc(var(--nj-col1) + 12px - ${DOT / 2}px)`,
        top: `calc(${FRAME}px + ${progress} * (100vh - ${2 * FRAME + DOT}px))`,
      }}
    />
  )
}
