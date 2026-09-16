import { ReactNode } from "react"

type SpotId = 1 | 2 | 3 | 4 | 5 | 6

const SPOT_POS: Record<SpotId, string> = {
  1: "col-start-1 row-start-1",
  2: "col-start-2 row-start-1",
  3: "col-start-1 row-start-2",
  4: "col-start-2 row-start-2",
  5: "col-start-1 row-start-3",
  6: "col-start-2 row-start-3",
}

const SPOT_DEFAULTS: Record<SpotId, string> = {
  1: "",
  2: "",
  3: "flex justify-end items-center text-right [container-type:size]",
  4: "",
  5: "",
  6: "",
}

const ROW_SPAN = { 1: "", 2: "row-span-2", 3: "row-span-3" } as const
const COL_SPAN = { 1: "", 2: "col-span-2" } as const

export const Spot = ({
  id,
  rowSpan = 1,
  colSpan = 1,
  className = "",
  children,
}: {
  id: SpotId
  rowSpan?: 1 | 2 | 3
  colSpan?: 1 | 2
  className?: string
  children?: ReactNode
}) => (
  <div
    data-spot={id}
    className={`${id === 5 ? "" : "m-px"} small:overflow-x-clip ${SPOT_POS[id]} ${ROW_SPAN[rowSpan]} ${COL_SPAN[colSpan]} ${SPOT_DEFAULTS[id]} ${className}`}
  >
    {children}
  </div>
)

export const SixSpotGrid = ({
  children,
  stagger = true,
  className = "min-h-screen",
}: {
  children: ReactNode
  stagger?: boolean
  className?: string
}) => (
  <div
    {...(stagger ? { "data-stagger-children": "" } : {})}
    className={`relative grid grid-cols-[max(0px,calc(var(--nj-col1)-18px))_1fr] grid-rows-[var(--nj-band-top)_var(--nj-band-h)_1fr] gap-x-0 small:gap-x-6 small:pl-[18px] small:overflow-x-clip ${className}`}
  >
    {children}
  </div>
)

/**
 * Static decorative guide lines aligned with SixSpotGrid tracks.
 * Render once in a layout (outside any page transition) so the lines stay
 * constant across navigation. Positions calculated against viewport via %.
 */
export const GridGuides = () => (
  <>
    {/* Horizontal: top page edge */}
    <div
      aria-hidden
      style={{ viewTransitionName: "nj-guide-top" }}
      className="hidden small:block pointer-events-none fixed left-0 right-0 h-px bg-nj-main guide-line guide-line-edge guide-line-h z-30 top-[18px]"
    />
    {/* Horizontal: bottom page edge */}
    <div
      aria-hidden
      style={{ viewTransitionName: "nj-guide-bottom" }}
      className="hidden small:block pointer-events-none fixed left-0 right-0 h-px bg-nj-main guide-line guide-line-edge guide-line-h z-30 bottom-[18px]"
    />
    {/* Vertical: left page edge, mirrors the sidebar guide on the right */}
    <div
      aria-hidden
      style={{ viewTransitionName: "nj-guide-0" }}
      className="hidden small:block pointer-events-none fixed top-0 bottom-0 w-[0.5px] bg-nj-main guide-line guide-line-edge guide-line-v z-30 left-[18px]"
    />
    {/* Vertical: col 1 right edge (left side of gutter) */}
    <div
      aria-hidden
      style={{ viewTransitionName: "nj-guide-1" }}
      className="hidden small:block pointer-events-none fixed top-0 bottom-0 w-[0.5px] bg-nj-main guide-line guide-line-v z-30 left-[var(--nj-col1)]"
    />
    {/* Vertical: col 2 left edge (right side of gutter) */}
    <div
      aria-hidden
      style={{ viewTransitionName: "nj-guide-2" }}
      className="hidden small:block pointer-events-none fixed top-0 bottom-0 w-[0.5px] bg-nj-main guide-line guide-line-v z-30 left-[calc(var(--nj-col1)+24px)]"
    />
    {/* Vertical: col 2 right edge (= main right edge / sidebar left) */}
    <div
      aria-hidden
      style={{ viewTransitionName: "nj-guide-3" }}
      className="hidden small:block pointer-events-none fixed top-0 bottom-0 w-[0.5px] bg-nj-main guide-line guide-line-edge guide-line-v z-30 right-0 small:right-[18px]"
    />
    {/* Horizontal: row 2 top */}
    <div
      aria-hidden
      style={{ viewTransitionName: "nj-guide-4" }}
      className="pointer-events-none fixed left-0 right-0 h-px bg-nj-main guide-line guide-line-h z-30 top-[var(--nj-band-top)]"
    />
    {/* Horizontal: row 2 bottom */}
    <div
      aria-hidden
      style={{ viewTransitionName: "nj-guide-5" }}
      className="pointer-events-none fixed left-0 right-0 h-px bg-nj-main guide-line guide-line-h z-30 top-[var(--nj-band-bottom)]"
    />
  </>
)

export default SixSpotGrid
