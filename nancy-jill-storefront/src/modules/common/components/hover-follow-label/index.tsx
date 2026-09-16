"use client"

import { useEffect, useRef, useState } from "react"

export default function HoverFollowLabel({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  const [visible, setVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const spanRef = useRef<HTMLSpanElement>(null)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })

  useEffect(() => {
    let raf = 0
    const pad = 8
    const gap = 12
    const tick = () => {
      const t = target.current
      const c = current.current
      c.x += (t.x - c.x) * 0.1
      c.y += (t.y - c.y) * 0.1
      const span = spanRef.current
      const cont = containerRef.current
      if (span && cont) {
        const cw = cont.clientWidth
        const ch = cont.clientHeight
        const w = span.offsetWidth
        const h = span.offsetHeight
        let left = c.x + gap
        if (left + w > cw - pad) left = c.x - gap - w
        if (left < pad) left = pad
        let top = c.y + gap
        if (top + h > ch - pad) top = c.y - gap - h
        if (top < pad) top = pad
        span.style.left = `${left}px`
        span.style.top = `${top}px`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    target.current.x = e.clientX - rect.left
    target.current.y = e.clientY - rect.top
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    target.current = { x, y }
    current.current = { x, y }
    setVisible(true)
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className ?? ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          ref={spanRef}
          className="absolute top-0 left-0 text-[14px] small:text-[12px] uppercase tracking-wide pointer-events-none whitespace-nowrap"
        >
          {label}
        </span>
      )}
    </div>
  )
}
