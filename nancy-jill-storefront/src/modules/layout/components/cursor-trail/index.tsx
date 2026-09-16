"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useParams, usePathname } from "next/navigation"

const HOLD = 900 // ms at full strength before fading starts
const FADE = 1600 // ms spent fading
const FLOOR = 0.25 // fraction of full ink a mark settles at once it stops fading
const SETTLE_LIFE = 20000 // ms an epoch of settled marks takes to fade to nothing
const INK = "3, 42, 143" // nj-main
const INK_ON_MEDIA = "255, 255, 255" // home sits on full-bleed imagery

// Brushes are stamped tip sprites, not lines: `size` is the tip diameter,
// `spacing` how far apart stamps sit as a fraction of it, `ink` the strength
// of one stamp. Picked in the right strip (see GuideToggle).
export const BRUSHES = {
  soft: { size: 16, spacing: 0.1, ink: 0.1 },
  grain: { size: 18, spacing: 0.22, ink: 0.16 },
  bristle: { size: 22, spacing: 0.12, ink: 0.13 },
  spray: { size: 30, spacing: 0.06, ink: 0.06 },
} as const

export type BrushId = keyof typeof BRUSHES

type Seg = {
  x1: number
  y1: number
  x2: number
  y2: number
  size: number
  t: number
  brush: BrushId
  seed: number
}

/** Tip sprite: an alpha mask already tinted with the ink colour. */
const makeTip = (id: BrushId, rgb: string): HTMLCanvasElement => {
  const size = BRUSHES[id].size
  const tip = document.createElement("canvas")
  tip.width = size
  tip.height = size
  const c = tip.getContext("2d")!
  const r = size / 2

  if (id === "soft") {
    const gradient = c.createRadialGradient(r, r, 0, r, r, r)
    gradient.addColorStop(0, "rgba(0,0,0,1)")
    gradient.addColorStop(0.5, "rgba(0,0,0,0.5)")
    gradient.addColorStop(1, "rgba(0,0,0,0)")
    c.fillStyle = gradient
    c.fillRect(0, 0, size, size)
  }

  if (id === "grain") {
    // Noise masked to a circle, so the stroke breaks up like chalk
    const image = c.createImageData(size, size)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const d = Math.hypot(x - r, y - r) / r
        const i = (y * size + x) * 4
        const falloff = d > 1 ? 0 : 1 - d * d
        image.data[i + 3] = Math.random() < 0.55 ? 0 : 255 * falloff * Math.random()
      }
    }
    c.putImageData(image, 0, 0)
  }

  if (id === "bristle") {
    // A handful of hairs at random radii: the gaps are what read as a brush
    for (let i = 0; i < 26; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.sqrt(Math.random()) * r
      const hair = 0.6 + Math.random() * 1.6
      c.globalAlpha = 0.25 + Math.random() * 0.6
      c.beginPath()
      c.arc(r + Math.cos(angle) * dist, r + Math.sin(angle) * dist, hair, 0, Math.PI * 2)
      c.fillStyle = "#000"
      c.fill()
    }
    c.globalAlpha = 1
  }

  if (id === "spray") {
    // Gaussian scatter: dense core thinning to loose overspray at the rim
    for (let i = 0; i < 260; i++) {
      const angle = Math.random() * Math.PI * 2
      const u = Math.max(1e-6, Math.random())
      const gauss = Math.sqrt(-2 * Math.log(u)) * Math.cos(Math.random() * Math.PI * 2)
      const dist = Math.abs(gauss) * (r / 2.6)
      if (dist > r) continue
      const fade = 1 - dist / r
      c.globalAlpha = (0.15 + Math.random() * 0.55) * fade
      c.beginPath()
      c.arc(
        r + Math.cos(angle) * dist,
        r + Math.sin(angle) * dist,
        0.35 + Math.random() * 0.75,
        0,
        Math.PI * 2
      )
      c.fillStyle = "#000"
      c.fill()
    }
    c.globalAlpha = 1
  }

  // Tint the mask
  c.globalCompositeOperation = "source-in"
  c.fillStyle = `rgb(${rgb})`
  c.fillRect(0, 0, size, size)
  return tip
}

export default function CursorTrail() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { countryCode } = useParams()
  const isHome = pathname === `/${countryCode}` || pathname === "/"

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const rgb = isHome ? INK_ON_MEDIA : INK
    // A few sprites per brush: one cached tip stamped every few pixels reads as
    // a repeating stencil. Which one a dab uses is a pure function of the
    // segment's seed and its position along it, so re-stamping a mark every
    // frame while it fades reproduces it exactly instead of boiling.
    const tips = new Map<BrushId, HTMLCanvasElement[]>()
    const tipFor = (id: BrushId, pick: number) => {
      let set = tips.get(id)
      if (!set) {
        set = Array.from({ length: 6 }, () => makeTip(id, rgb))
        tips.set(id, set)
      }
      return set[pick % set.length]
    }

    let pen: { x: number; y: number } | null = null
    let target: { x: number; y: number } | null = null
    let drawing = false
    let frame = 0
    let fresh: Seg[] = []
    // Marks that have finished fading are stamped into a layer and drawn back
    // as one image, so old work costs a single draw call a frame. Two layers,
    // swapped every SETTLE_LIFE: `settled` collects, `retiring` fades out and
    // is then recycled as the next collector. Erasing a layer in place can't
    // do this - destination-out is multiplicative, so 8-bit alpha stalls a few
    // steps above zero and leaves a permanent smudge. A layer drawn at a
    // computed alpha reaches 0 exactly, and is cleared when it does.
    let settled = document.createElement("canvas")
    let settledCtx = settled.getContext("2d")!
    let retiring = document.createElement("canvas")
    let retiringCtx = retiring.getContext("2d")!
    let epochStart = performance.now()

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const layer = () => {
        const c = document.createElement("canvas")
        c.width = canvas.width
        c.height = canvas.height
        const cx = c.getContext("2d")!
        cx.setTransform(dpr, 0, 0, dpr, 0, 0)
        return [c, cx] as const
      }
      ;[settled, settledCtx] = layer()
      ;[retiring, retiringCtx] = layer()
      epochStart = performance.now()
      pen = null
      fresh = []
    }

    const point = (e: MouseEvent) => ({ x: e.clientX, y: e.clientY })

    /** null while the brush picker is cycled past its last brush, to "off". */
    const currentBrush = (): BrushId | null => {
      const id = document.documentElement.dataset.njBrush
      if (id === "off") return null
      return id && id in BRUSHES ? (id as BrushId) : "soft"
    }

    /** Walk the segment, stamping the tip every `spacing` of its width. */
    const stamp = (
      into: CanvasRenderingContext2D,
      seg: Seg,
      strength: number
    ) => {
      const { spacing } = BRUSHES[seg.brush]
      const dx = seg.x2 - seg.x1
      const dy = seg.y2 - seg.y1
      const dist = Math.hypot(dx, dy)
      const step = Math.max(0.5, seg.size * spacing)
      const half = seg.size / 2

      into.globalAlpha = strength
      let i = 0
      for (let d = 0; d <= dist; d += step, i++) {
        const t = dist === 0 ? 0 : d / dist
        into.drawImage(
          tipFor(seg.brush, seg.seed + i),
          seg.x1 + dx * t - half,
          seg.y1 + dy * t - half,
          seg.size,
          seg.size
        )
      }
      into.globalAlpha = 1
    }

    const down = (e: MouseEvent) => {
      if (!currentBrush()) return
      drawing = true
      target = point(e)
      pen = { ...target }
      document.documentElement.classList.add("nj-drawing")
    }

    const up = () => {
      drawing = false
      document.documentElement.classList.remove("nj-drawing")
    }

    const move = (e: MouseEvent) => {
      target = point(e)
    }

    const draw = () => {
      const now = performance.now()

      // End of an epoch: the retiring layer has reached zero, so wipe it and
      // hand it to the collector, and the layer that was collecting starts its
      // own fade. A settled mark therefore lives 1-2 x SETTLE_LIFE.
      const epochAge = now - epochStart
      if (epochAge >= SETTLE_LIFE) {
        const spent = retiring
        const spentCtx = retiringCtx
        retiring = settled
        retiringCtx = settledCtx
        settled = spent
        settledCtx = spentCtx
        settledCtx.clearRect(0, 0, window.innerWidth, window.innerHeight)
        epochStart = now
      }

      // Only lay ink down where the pointer actually travelled: a plain click
      // (advancing the media cycle, say) held still would otherwise stamp a dot
      // every frame. The pen holds its position until it has somewhere to go,
      // so slow drags still register.
      const id = currentBrush()
      const speed =
        drawing && target && pen ? Math.hypot(target.x - pen.x, target.y - pen.y) : 0
      if (id && drawing && target && pen && speed > 0) {
        const from = { ...pen }
        pen.x = target.x
        pen.y = target.y
        // Faster strokes run thinner, the way a real brush lifts off
        const size = BRUSHES[id].size * Math.max(0.45, 1 - speed / 90)
        fresh.push({
          x1: from.x,
          y1: from.y,
          x2: pen.x,
          y2: pen.y,
          size,
          t: now,
          brush: id,
          seed: (Math.random() * 0x7fffffff) | 0,
        })
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      ctx.globalAlpha = FLOOR * Math.max(0, 1 - (now - epochStart) / SETTLE_LIFE)
      ctx.drawImage(retiring, 0, 0, window.innerWidth, window.innerHeight)
      ctx.globalAlpha = FLOOR
      ctx.drawImage(settled, 0, 0, window.innerWidth, window.innerHeight)
      ctx.globalAlpha = 1

      const still: Seg[] = []
      for (const seg of fresh) {
        const age = now - seg.t
        const ink = BRUSHES[seg.brush].ink
        if (age >= HOLD + FADE) {
          stamp(settledCtx, seg, ink)
          continue
        }
        const decay = age <= HOLD ? 0 : (age - HOLD) / FADE
        stamp(ctx, seg, ink * (1 - decay * (1 - FLOOR)))
        still.push(seg)
      }
      fresh = still

      frame = requestAnimationFrame(draw)
    }

    resize()
    frame = requestAnimationFrame(draw)
    window.addEventListener("mousemove", move, { passive: true })
    window.addEventListener("mousedown", down)
    window.addEventListener("mouseup", up)
    window.addEventListener("blur", up)
    window.addEventListener("resize", resize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("mousemove", move)
      window.removeEventListener("mousedown", down)
      window.removeEventListener("mouseup", up)
      window.removeEventListener("blur", up)
      window.removeEventListener("resize", resize)
      document.documentElement.classList.remove("nj-drawing")
    }
  }, [isHome, mounted])

  // Portalled to <body>: inside the page tree an ancestor was acting as the
  // containing block, so "fixed" sized the canvas to the whole document.
  if (!mounted) {
    return null
  }

  return createPortal(
    <canvas
      ref={ref}
      aria-hidden
      className={`hidden small:block pointer-events-none fixed top-0 left-0 w-screen h-screen ${
        isHome ? "z-10" : "z-0"
      }`}
    />,
    document.body
  )
}
