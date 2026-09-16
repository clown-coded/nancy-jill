"use client"

import { updateRegion } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { useMemo, useState } from "react"
import { useParams, usePathname } from "next/navigation"

export default function CurrencySwitcher({
  regions,
  fallback = "NZD",
  className = "",
}: {
  regions: HttpTypes.StoreRegion[] | null
  fallback?: string
  className?: string
}) {
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const { countryCode } = useParams()
  const pathname = usePathname()
  const currentPath = pathname.split(`/${countryCode}`)[1]

  const currencyOptions = useMemo(() => {
    if (!regions) return []
    const seen = new Set<string>()
    return regions
      .filter((r) => {
        if (seen.has(r.currency_code)) return false
        seen.add(r.currency_code)
        return true
      })
      .map((r) => ({
        currency_code: r.currency_code.toUpperCase(),
        country_code: r.countries?.[0]?.iso_2 ?? "",
      }))
  }, [regions])

  const currentCurrency = useMemo(() => {
    if (!regions || !countryCode) return null
    const region = regions.find((r) =>
      r.countries?.some((c) => c.iso_2 === countryCode)
    )
    return region?.currency_code?.toUpperCase() ?? null
  }, [regions, countryCode])

  return (
    <div className={className}>
      <button
        onClick={() => setCurrencyOpen(!currencyOpen)}
        disabled={currencyOptions.length <= 1}
        className={`text-[14px] small:text-[12px] uppercase transition-all ${
          currencyOptions.length > 1 ? "hover:italic cursor-pointer" : "cursor-default"
        }`}
      >
        {currentCurrency || fallback}
      </button>
      {currencyOpen && currencyOptions.length > 1 && (
        <div className="flex flex-col">
          {currencyOptions
            .filter((o) => o.currency_code !== currentCurrency)
            .map((o) => (
              <button
                key={o.currency_code}
                onClick={() => {
                  updateRegion(o.country_code, currentPath)
                  setCurrencyOpen(false)
                }}
                className="text-[14px] small:text-[12px] uppercase text-left opacity-50 hover:opacity-100 hover:italic transition-all cursor-pointer"
              >
                {o.currency_code}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
