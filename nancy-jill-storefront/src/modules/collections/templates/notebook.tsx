"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { SixSpotGrid, Spot } from "@modules/layout/components/six-spot-grid"
import { HttpTypes } from "@medusajs/types"

type NotebookTemplateProps = {
  collection: HttpTypes.StoreCollection
}

const padded = (n: number) => String(n).padStart(2, "0")

const tryParseArray = (raw: unknown): unknown[] => {
  if (Array.isArray(raw)) return raw
  if (typeof raw === "string") {
    const trimmed = raw.trim()
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) return parsed
      } catch {
        /* ignore */
      }
    }
    return trimmed.split(",").map((s) => s.trim()).filter(Boolean)
  }
  return []
}

const extractUrl = (entry: unknown): string | null => {
  if (typeof entry === "string") return entry.trim() || null
  if (entry && typeof entry === "object") {
    const r = entry as Record<string, unknown>
    if (typeof r.url === "string") return r.url
  }
  return null
}

const extractImages = (meta: Record<string, unknown> | null | undefined): string[] => {
  const rowsArr = tryParseArray(meta?.editorial_rows)
  if (rowsArr.length) {
    const urls: string[] = []
    for (const entry of rowsArr) {
      const inner =
        entry && typeof entry === "object" && "items" in entry
          ? (entry as { items?: unknown }).items
          : entry
      const itemsArr = tryParseArray(inner)
      for (const it of itemsArr) {
        const u = extractUrl(it)
        if (u) urls.push(u)
      }
    }
    if (urls.length) return urls
  }
  const flatArr = tryParseArray(meta?.editorial_images)
  return flatArr.map(extractUrl).filter((u): u is string => !!u)
}

export default function NotebookTemplate({ collection }: NotebookTemplateProps) {
  const images = extractImages(collection.metadata)

  const rawForSale = collection.metadata?.for_sale
  const forSale =
    rawForSale === true ||
    (typeof rawForSale === "string" && rawForSale.toLowerCase() === "true")

  const [idx, setIdx] = useState(0)
  const [half, setHalf] = useState<"left" | "right" | null>(null)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const halfRef = useRef<"left" | "right" | null>(null)
  const containerRef = useRef<HTMLButtonElement>(null)
  const spanRef = useRef<HTMLSpanElement>(null)

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
  }, [])

  const halfFromEvent = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return e.clientX - rect.left < rect.width / 2 ? "left" : "right"
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!images.length) return
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

  return (
    <SixSpotGrid>
      <Spot id={2} rowSpan={3} className="min-w-0 h-screen">
        {!!images.length && (
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
            <Image
              key={images[idx]}
              src={images[idx]}
              alt={`${collection.title} notebook ${idx + 1}`}
              fill
              sizes="66vw"
              priority
              style={{ objectFit: "contain" }}
            />
            {images.length > 1 &&
              Array.from(
                new Set([
                  images[(idx + 1) % images.length],
                  images[(idx - 1 + images.length) % images.length],
                ])
              )
                .filter((u) => u && u !== images[idx])
                .map((u) => (
                  <Image
                    key={`prefetch-${u}`}
                    src={u}
                    alt=""
                    fill
                    sizes="66vw"
                    aria-hidden
                    style={{ objectFit: "contain", opacity: 0, pointerEvents: "none" }}
                  />
                ))}
            {half && (
              <span
                ref={spanRef}
                className="absolute top-0 left-0 text-[14px] small:text-[12px] uppercase tracking-wide pointer-events-none"
              >
                {half === "left" ? "prev" : "next"}
              </span>
            )}
          </button>
        )}
      </Spot>

      <Spot
        id={3}
        className="hidden small:flex fixed top-[var(--nj-band-top)] left-0 h-[var(--nj-band-h)] w-[var(--nj-col1)] small:left-[18px] small:w-[calc(var(--nj-col1)-18px)] z-20 pointer-events-none"
      >
        <h1 className="nj-band-title">
          {collection.title}
        </h1>
      </Spot>

      {images.length > 1 && (
        <div className="hidden small:flex fixed top-[var(--nj-band-top)] left-[calc(var(--nj-col1)+24px)] h-[var(--nj-band-h)] z-20 text-[12px] tracking-wide pointer-events-none items-center px-2 whitespace-nowrap">
          [{padded(idx + 1)}/{padded(images.length)}]
        </div>
      )}

      <Spot
        id={5}
        className="fixed top-[var(--nj-band-bottom)] left-0 bottom-0 small:bottom-[18px] w-[var(--nj-col1)] small:left-[18px] small:w-[calc(var(--nj-col1)-18px)] z-20 hidden small:flex flex-col justify-end text-[14px] small:text-[12px] leading-tight"
      >
        {!!collection.metadata?.description && (
          <p className="mb-4 max-w-[500px] whitespace-pre-line pr-24">
            {String(collection.metadata.description)}
          </p>
        )}
        {forSale && (
          <LocalizedClientLink
            href={`/collections/${collection.handle}/shop`}
            className="uppercase hover:italic inline-block"
          >
            Shop the collection
          </LocalizedClientLink>
        )}
      </Spot>
    </SixSpotGrid>
  )
}
