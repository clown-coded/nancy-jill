"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import React, { useEffect, useRef, useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  onIndexChange?: (index: number, total: number) => void
}

const ImageGallery = ({ images, onIndexChange }: ImageGalleryProps) => {
  const [isMobile, setIsMobile] = useState(false)
  const [idx, setIdx] = useState(0)
  const [half, setHalf] = useState<"left" | "right" | null>(null)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const halfRef = useRef<"left" | "right" | null>(null)
  const containerRef = useRef<HTMLButtonElement>(null)
  const spanRef = useRef<HTMLSpanElement>(null)
  const touch = useRef<{ x: number; y: number; swiped: boolean }>({ x: 0, y: 0, swiped: false })

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    onIndexChange?.(idx, images.length)
  }, [idx, images.length, onIndexChange])

  useEffect(() => {
    if (isMobile) return
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
        const side = halfRef.current
        let left = side === "left" ? c.x - gap - w : c.x + gap
        if (left < pad) left = Math.min(c.x + gap, cw - w - pad)
        else if (left + w > cw - pad) left = Math.max(c.x - gap - w, pad)
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
  }, [isMobile])

  if (isMobile) {
    const image = images[idx]
    const nextIm = images[(idx + 1) % images.length]
    const prevIm = images[(idx - 1 + images.length) % images.length]
    const neighbors = Array.from(
      new Set([prevIm, nextIm].filter((im) => im && im !== image))
    )
    return (
      <div
        className="w-full h-[calc(var(--nj-vh)*0.83)] relative cursor-pointer touch-pan-y"
        onClick={() => {
          if (touch.current.swiped) return
          setIdx((i) => (i + 1) % images.length)
        }}
        onTouchStart={(e) => {
          touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, swiped: false }
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touch.current.x
          const dy = e.changedTouches[0].clientY - touch.current.y
          if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return
          touch.current.swiped = true
          setIdx((i) => (dx < 0 ? i + 1 : i - 1 + images.length) % images.length)
        }}
      >
        {neighbors.map((im) => (
          <link
            key={`preload-m-${im.id}`}
            rel="preload"
            as="image"
            href={im.url || ""}
          />
        ))}
        {!!image?.url && (
          <Image
            src={image.url}
            priority
            alt={`Product image ${idx + 1}`}
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        )}
        {/* Mobile controls: prev / counter / next */}
        <div className="absolute bottom-2 inset-x-2 z-10 grid grid-cols-3 items-center text-[14px] small:text-[12px] uppercase tracking-wide text-nj-bg">
          <button
            type="button"
            aria-label="Previous image"
            className="hover:italic justify-self-start"
            onClick={(e) => {
              e.stopPropagation()
              setIdx((i) => (i - 1 + images.length) % images.length)
            }}
          >
            prev
          </button>
          <span className="pointer-events-none text-[12px] justify-self-center">
            [{String(idx + 1).padStart(2, "0")}/{String(images.length).padStart(2, "0")}]
          </span>
          <button
            type="button"
            aria-label="Next image"
            className="hover:italic justify-self-end"
            onClick={(e) => {
              e.stopPropagation()
              setIdx((i) => (i + 1) % images.length)
            }}
          >
            next
          </button>
        </div>
        {neighbors.map((im) => (
          <Image
            key={`prefetch-m-${im.id}`}
            src={im.url || ""}
            alt=""
            fill
            sizes="100vw"
            aria-hidden
            style={{ objectFit: "cover", opacity: 0, pointerEvents: "none" }}
          />
        ))}
      </div>
    )
  }

  if (!images.length) return null

  const halfFromEvent = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return e.clientX - rect.left < rect.width / 2 ? "left" : "right"
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (halfFromEvent(e) === "left") {
      setIdx((i) => (i - 1 + images.length) % images.length)
    } else {
      setIdx((i) => (i + 1) % images.length)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    target.current.x = e.clientX - rect.left
    target.current.y = e.clientY - rect.top
    const h = halfFromEvent(e)
    halfRef.current = h
    if (h !== half) setHalf(h)
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    target.current = { x, y }
    current.current = { x, y }
    const h = halfFromEvent(e)
    halfRef.current = h
    setHalf(h)
  }

  const image = images[idx]
  const nextIdx = (idx + 1) % images.length
  const prevIdx = (idx - 1 + images.length) % images.length
  const neighborImages = Array.from(
    new Set([images[prevIdx], images[nextIdx]].filter((im) => im && im !== image))
  )

  return (
    <div className="h-screen sticky top-0 w-full overflow-hidden">
      {neighborImages.map((im) => (
        <link
          key={`preload-${im.id}`}
          rel="preload"
          as="image"
          href={im.url || ""}
        />
      ))}
      <button
        ref={containerRef}
        type="button"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { halfRef.current = null; setHalf(null) }}
        className="relative block w-full h-full cursor-pointer"
        aria-label="Previous on left half, next on right half"
      >
        {!!image?.url && (
          <Image
            key={image.id}
            src={image.url}
            priority
            alt={`Product image ${idx + 1}`}
            fill
            sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
            style={{ objectFit: "contain", objectPosition: "left center" }}
          />
        )}
        {neighborImages.map((im) => (
          <Image
            key={`prefetch-${im.id}`}
            src={im.url || ""}
            alt=""
            fill
            sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
            aria-hidden
            style={{ objectFit: "contain", objectPosition: "left center", opacity: 0, pointerEvents: "none" }}
          />
        ))}
        {half && images.length > 1 && (
          <span
            ref={spanRef}
            className="absolute top-0 left-0 text-[14px] small:text-[12px] uppercase tracking-wide pointer-events-none"
          >
            {half === "left" ? "prev" : "next"}
          </span>
        )}
      </button>
    </div>
  )
}

export default ImageGallery
