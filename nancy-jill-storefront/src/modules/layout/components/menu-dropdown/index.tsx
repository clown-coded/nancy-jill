"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import CurrencySwitcher from "@modules/layout/components/currency-switcher"

const MENU_CLOSE_MS = 300

const menuItems = [
  { name: "COLLECTIONS", href: "/collections" },
  { name: "SHOP", href: "/store" },
  { name: "ABOUT", href: "/" },
]

type SearchProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
}

export default function MenuDropdown({
  open,
  onClose,
  regions = null,
}: {
  open: boolean
  onClose?: () => void
  regions?: HttpTypes.StoreRegion[] | null
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchProduct[]>([])
  const [searching, setSearching] = useState(false)
  const innerRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined)
  const router = useRouter()
  const { countryCode } = useParams()

  const navigateAfterClose = (href: string) => {
    onClose?.()
    setTimeout(() => router.push(`/${countryCode}${href}`), MENU_CLOSE_MS)
  }

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timeout = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/products?q=${encodeURIComponent(query.trim())}&limit=10`,
          {
            headers: {
              "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
            },
          }
        )
        const data = await res.json()
        setResults(data.products || [])
      } catch {
        setResults([])
      }
      setSearching(false)
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  // Observe inner content size changes
  useEffect(() => {
    if (!innerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContentHeight(entry.target.scrollHeight)
      }
    })
    observer.observe(innerRef.current)
    return () => observer.disconnect()
  }, [])

  // Clear search when menu closes
  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
    }
  }, [open])

  return (
    <>
      <div
        className={`fixed top-0 left-0 w-full md:w-[calc(50%+18px)] lg:w-[calc(33.3333%+18px)] xl:w-[calc(25%+18px)] z-10 transition-[transform,opacity] duration-300 ease-in-out ${
          open
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="bg-nj-main overflow-hidden transition-[height] duration-300 ease-in-out"
          style={{ height: contentHeight ? `${contentHeight}px` : "auto" }}
        >
        <div ref={innerRef} className="pt-48 p-2 small:px-[18px] flex flex-col">
          {menuItems.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => navigateAfterClose(item.href)}
              className="text-nj-bg leading-tight text-[42px] uppercase font-light hover:opacity-75 text-left"
            >
              {item.name}
            </button>
          ))}

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH"
            className="bg-transparent text-nj-bg leading-tight text-[42px] font-light placeholder-nj-bg outline-none w-full"
          />

          {/* Search results */}
          {results.length > 0 && (
            <div className="flex flex-col pt-12">
              {results.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => navigateAfterClose(`/products/${product.handle}`)}
                  className="text-nj-bg text-sm tracking-wider py-2 hover:italic transition-all text-left"
                >
                  {product.title}
                </button>
              ))}
            </div>
          )}

         

          {!searching && query.trim() && results.length === 0 && (
            <p className="italic text-sm text-nj-bg tracking-wider py-2 pt-12">
              No results
            </p>
          )}

          {/* Mobile only; desktop currency lives in the nav */}
          <CurrencySwitcher regions={regions} className="small:hidden pt-12 text-nj-bg" />

        </div>
        </div>
      </div>
    </>
  )
}
