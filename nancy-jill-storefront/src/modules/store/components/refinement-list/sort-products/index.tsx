"use client"

import { useState } from "react"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: SortOptions) => void
  "data-testid"?: string
}

const sortOptions: { value: SortOptions; label: string }[] = [
  { value: "created_at", label: "Latest Arrivals" },
  { value: "price_asc", label: "Price: Low -> High" },
  { value: "price_desc", label: "Price: High -> Low" },
]

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
}: SortProductsProps) => {
  const [open, setOpen] = useState(false)

  const handleChange = (value: SortOptions) => {
    setQueryParams("sortBy", value)
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-y-2" data-testid={dataTestId}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="hover:italic hover:opacity-75 transition-all duration-300 text-[14px] small:text-[12px] uppercase text-left"
      >
        Sort by
      </button>
      {open && (
        <div className="flex flex-col gap-y-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleChange(opt.value)}
              className={`hover:italic hover:opacity-75 transition-all duration-300 text-[14px] small:text-[12px] text-left ${
                opt.value === sortBy ? "italic" : ""
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SortProducts
