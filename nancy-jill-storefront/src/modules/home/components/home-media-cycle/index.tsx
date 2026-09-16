"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const isVideo = (url: string) =>
  /\.(mp4|webm|mov|m4v|ogv|ogg|avi|mkv|mpeg|mpg|qt|flv|3gp|3g2)(\?|#|$)/i.test(url)

type Item = { url: string; alt: string }

export default function HomeMediaCycle({
  items,
  collectionHref,
  sizes = "100vw",
}: {
  items: Item[]
  collectionHref: string
  sizes?: string
}) {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (items.length < 2) return
    const advance = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      if (!t) return
      if (
        t.closest(
          "a, button, input, textarea, select, label, [role=button], [data-no-cycle]"
        )
      ) {
        return
      }
      setI((v) => (v + 1) % items.length)
    }
    document.addEventListener("click", advance)
    return () => document.removeEventListener("click", advance)
  }, [items.length])

  if (!items.length) return null

  const padded = (n: number) => String(n).padStart(2, "0")

  return (
    <>
      <div className="fixed top-[var(--nj-band-top)] left-[calc(var(--nj-col1)+24px)] h-[var(--nj-band-h)] z-20 text-[12px] tracking-wide flex items-center px-2 whitespace-nowrap pointer-events-none">
        [ {padded(i + 1)}/{padded(items.length)} ]
      </div>
      <div className="fixed top-[var(--nj-band-bottom)] left-0 w-[var(--nj-col1)] small:left-[18px] small:w-[calc(var(--nj-col1)-18px)] z-20 hidden small:flex justify-end p-2 text-[12px] tracking-wide pointer-events-none">
        <LocalizedClientLink
          href={collectionHref}
          className="pointer-events-auto hover:italic uppercase"
        >
          view the collection
        </LocalizedClientLink>
      </div>
      {/* All items stay mounted and stacked so switching is a cross-fade, not a swap */}
      <div className="relative h-full w-full">
        {items.map((item, index) => (
          <div
            key={item.url}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === i ? "opacity-100" : "opacity-0"
            }`}
          >
            {isVideo(item.url) ? (
              <video
                src={item.url}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="h-full w-full object-cover block"
              />
            ) : (
              <Image
                src={item.url}
                alt={item.alt}
                width={0}
                height={0}
                sizes={sizes}
                priority={index === 0}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        ))}
      </div>
    </>
  )
}
