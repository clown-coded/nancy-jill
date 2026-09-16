"use client"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

type ProductType = { id: string; value: string }

type Props = {
  collections: HttpTypes.StoreCollection[]
  types: ProductType[]
}

export default function StoreFilters({ collections, types }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const activeCollection = params.get("collection") || ""
  const activeType = params.get("type") || ""
  const inStock = params.get("in_stock") === "1"

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString())
    if (value === null || value === "") next.delete(key)
    else next.set(key, value)
    next.delete("page")
    const qs = next.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ""}`)
  }

  return (
    <>
      <div className="fixed top-[var(--nj-band-top)] left-0 h-[var(--nj-band-h)] w-[var(--nj-col1)] small:left-[18px] small:w-[calc(var(--nj-col1)-18px)] z-30 p-2 hidden small:flex items-center text-[14px] small:text-[12px] leading-tight">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
        >
          [ filter by {open ? "−" : "+"} ]
        </button>
      </div>

      {open && (
        <div className="fixed top-[var(--nj-band-bottom)] left-0 bottom-0 small:bottom-[18px] w-[var(--nj-col1)] small:left-[18px] small:w-[calc(var(--nj-col1)-18px)] z-30 p-2 hidden small:flex flex-col gap-y-3 text-[14px] small:text-[12px] leading-tight overflow-y-auto">
          <div className="flex flex-col gap-y-1">
            <span className="uppercase text-[14px] small:text-[12px] tracking-wide">collection</span>
            <div className="flex flex-col gap-y-1 pl-3">
              <button
                type="button"
                onClick={() => updateParam("collection", null)}
                className={`text-left hover:italic ${activeCollection === "" ? "italic" : ""}`}
              >
                all
              </button>
              {collections.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => updateParam("collection", c.handle || c.id)}
                  className={`text-left hover:italic ${
                    activeCollection === (c.handle || c.id) ? "italic" : ""
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-y-1">
            <span className="uppercase text-[14px] small:text-[12px] tracking-wide">type</span>
            <div className="flex flex-col gap-y-1 pl-3">
              <button
                type="button"
                onClick={() => updateParam("type", null)}
                className={`text-left hover:italic ${activeType === "" ? "italic" : ""}`}
              >
                all
              </button>
              {types.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => updateParam("type", t.value || t.id)}
                  className={`text-left hover:italic ${
                    activeType === (t.value || t.id) ? "italic" : ""
                  }`}
                >
                  {t.value}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-y-1">
            <span className="uppercase text-[14px] small:text-[12px] tracking-wide">stock</span>
            <div className="flex flex-col gap-y-1 pl-3">
              <button
                type="button"
                onClick={() => updateParam("in_stock", inStock ? null : "1")}
                className="text-left hover:italic"
              >
                {inStock ? "[x]" : "[ ]"} in stock only
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
