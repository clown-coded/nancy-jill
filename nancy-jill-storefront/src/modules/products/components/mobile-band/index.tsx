"use client"

import { useEffect, useState } from "react"

type Stage = "collection" | "product" | "more"

/**
 * Mobile-only band label. Three stages as the page scrolls:
 * collection number → product title + price → "see more [...]" over related products.
 * Band grows once past the collection number, and reverts only back at the top.
 */
export default function MobileBand({
  collectionTitle,
  productTitle,
  price,
  watchId,
  relatedId,
}: {
  collectionTitle?: string
  productTitle: string
  price: string | null
  watchId: string
  relatedId: string
}) {
  const [stage, setStage] = useState<Stage>("collection")

  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const el = document.getElementById(watchId)
    if (!el) return
    // Band offset read once; scroll work is rAF-throttled to stay off the scroll frame
    const band =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--nj-band-bottom"
        )
      ) || 0
    let queued = false
    const check = () => {
      queued = false
      const y = window.scrollY
      setScrolled(y > 0)
      const related = document.getElementById(relatedId)
      setStage((was) => {
        if (y <= 1) return "collection"
        if (related && related.getBoundingClientRect().top < band) return "more"
        if (was === "more") return "product"
        return was === "product" || el.getBoundingClientRect().top < band
          ? "product"
          : "collection"
      })
    }
    const onScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(check)
    }
    check()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [watchId, relatedId])

  // Grows the band while anything but the collection number is showing (see globals.css)
  useEffect(() => {
    document.documentElement.classList.toggle(
      "nj-band-tall",
      stage !== "collection"
    )
    return () => document.documentElement.classList.remove("nj-band-tall")
  }, [stage])

  // Staged: old text fades out (150ms) → band slides open (500ms) → new text fades in (200ms)
  const FADE = 150
  const GROW = 500

  // Layers cross-fade in place; only a change of band height waits for the slide
  const layer = (on: boolean, grows: boolean) => ({
    opacity: on ? 1 : 0,
    transition: `opacity ${on ? 200 : FADE}ms ease-out ${
      on && grows ? FADE + GROW : 0
    }ms`,
  })

  return (
    <div
      style={{
        transition: `height ${GROW}ms cubic-bezier(0.22, 1, 0.36, 1) ${FADE}ms, background-color 300ms ease-out, color 300ms ease-out`,
      }}
      className={`small:hidden fixed top-[var(--nj-band-top)] inset-x-0 h-[var(--nj-band-h)] z-20 grid items-end px-2 pb-1 tracking-wide uppercase pointer-events-none overflow-hidden ${
        scrolled ? "bg-nj-bg text-nj-main" : "nj-overlay-text"
      }`}
    >
      <span
        style={layer(stage === "collection", true)}
        className="col-start-1 row-start-1 truncate text-[12px]"
      >
        {collectionTitle}
      </span>
      <span
        style={layer(stage === "product", true)}
        className="col-start-1 row-start-1 flex items-baseline justify-between gap-x-3"
      >
        <span className="truncate text-[20px] leading-none">{productTitle}</span>
        {!!price && (
          <span className="shrink-0 text-[14px] small:text-[12px] leading-none">{price}</span>
        )}
      </span>
      <span
        style={layer(stage === "more", false)}
        className="col-start-1 row-start-1 text-[20px] leading-none"
      >
        see more [...]
      </span>
    </div>
  )
}
