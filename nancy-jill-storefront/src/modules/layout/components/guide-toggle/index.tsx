"use client"

import { useEffect, useState } from "react"
import { BRUSHES, type BrushId } from "@modules/layout/components/cursor-trail"

const STORAGE_KEY = "nj-hide-guides"
const BG_KEY = "nj-bg"
const BGS = ["#ffffff", "#fff7fc", "#fffef7", "#f8f7ff"]
const BRUSH_KEY = "nj-brush"
const BRUSH_IDS: BrushId[] = ["soft", "grain", "bristle", "spray"]
// "off" is the last stop in the cycle: click past the last brush to stop drawing
const BRUSH_CYCLE = [...BRUSH_IDS, "off"] as const
type BrushChoice = (typeof BRUSH_CYCLE)[number]

export default function GuideToggle() {
  const [hidden, setHidden] = useState(false)
  const [bg, setBg] = useState<string | null>(null)
  const [brush, setBrush] = useState<BrushChoice>("soft")

  useEffect(() => {
    const v = localStorage.getItem(STORAGE_KEY) === "1"
    setHidden(v)
    document.documentElement.classList.toggle("guides-hidden", v)

    const savedBrush = localStorage.getItem(BRUSH_KEY) as BrushChoice | null
    if (savedBrush && BRUSH_CYCLE.includes(savedBrush)) {
      setBrush(savedBrush)
      document.documentElement.dataset.njBrush = savedBrush
    }

    const saved = localStorage.getItem(BG_KEY)
    if (saved && BGS.includes(saved)) {
      setBg(saved)
      document.documentElement.style.setProperty("--nj-bg", saved)
    }
  }, [])

  const toggle = () => {
    const next = !hidden
    setHidden(next)
    document.documentElement.classList.toggle("guides-hidden", next)
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0")
  }

  const pickBg = (color: string) => {
    setBg(color)
    document.documentElement.style.setProperty("--nj-bg", color)
    localStorage.setItem(BG_KEY, color)
  }

  const cycleBrush = () => {
    const next = BRUSH_CYCLE[(BRUSH_CYCLE.indexOf(brush) + 1) % BRUSH_CYCLE.length]
    setBrush(next)
    document.documentElement.dataset.njBrush = next
    localStorage.setItem(BRUSH_KEY, next)
  }

  return (
    <div
      style={{ viewTransitionName: "nj-guide-toggle" }}
      className="hidden small:flex fixed right-0 top-[18px] h-[calc(var(--nj-band-top)-18px)] w-[18px] flex-col items-center justify-between py-2 z-40 text-nj-main nj-fade-in-2"
    >
      <button
        type="button"
        onClick={toggle}
        className="cursor-pointer"
        aria-label={hidden ? "Show guides" : "Hide guides"}
      >
        <span className="relative block [writing-mode:vertical-rl] leading-none whitespace-nowrap text-[12px] tracking-wide uppercase">
          {/* Invisible widest label reserves the height so the swatches below don't shift on toggle */}
          <span aria-hidden className="invisible">[SHOW GUIDES]</span>
          <span className="absolute inset-0">[{hidden ? "SHOW" : "HIDE"} GUIDES]</span>
        </span>
      </button>

      <div className="flex flex-col items-center gap-y-1">
        {BGS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => pickBg(color)}
            style={{ backgroundColor: color }}
            className={`w-3 h-3 shrink-0 cursor-pointer border ${
              bg === color ? "border-nj-main" : "border-nj-main/30"
            }`}
            aria-label={`Background ${color}`}
            aria-pressed={bg === color}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={cycleBrush}
        className="w-3 h-3 shrink-0 cursor-pointer border border-nj-main flex items-center justify-center"
        aria-label={`Brush: ${brush}`}
        title={brush}
      >
        {brush !== "off" && (
          <span
            className="block rounded-full bg-nj-main"
            style={{
              width: 2 + BRUSH_IDS.indexOf(brush) * 2,
              height: 2 + BRUSH_IDS.indexOf(brush) * 2,
            }}
          />
        )}
      </button>
    </div>
  )
}
