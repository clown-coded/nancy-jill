"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "nj-cookies-accepted"
// Guides finish at 2000ms, nj-fade-in-2 at 2400ms + 500ms fade: banner comes in last
const INTRO_MS = 3000

export default function CookieBanner() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "1") {
      return
    }
    const timeout = setTimeout(() => setOpen(true), INTRO_MS)
    return () => clearTimeout(timeout)
  }, [])

  const dismiss = (accepted: boolean) => {
    if (accepted) {
      localStorage.setItem(STORAGE_KEY, "1")
    }
    setOpen(false)
  }

  return (
    <div
      data-testid="cookie-banner"
      className={`fixed bottom-0 left-0 w-full md:w-1/2 lg:w-4/12 xl:w-3/12 z-40 transition-[transform,opacity] duration-300 ease-in-out ${
        open
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-nj-main px-2 pt-2 pb-4 flex flex-col gap-y-4 text-nj-bg uppercase font-light">
        <p className="text-[32px] lg:leading-10">We use cookies</p>
        <div className="flex gap-x-6 text-[32px] lg:leading-10">
          <button
            type="button"
            onClick={() => dismiss(true)}
            className="hover:italic"
            data-testid="cookie-accept-button"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => dismiss(false)}
            className="hover:italic"
            data-testid="cookie-dismiss-button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
