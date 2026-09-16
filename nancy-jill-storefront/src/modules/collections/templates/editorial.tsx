import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { SixSpotGrid, Spot } from "@modules/layout/components/six-spot-grid"
import { HttpTypes } from "@medusajs/types"

type EditorialTemplateProps = {
  collection: HttpTypes.StoreCollection
}

const isVideo = (url: string) =>
  /\.(mp4|webm|mov|m4v|ogv|ogg|avi|mkv|mpeg|mpg|qt|flv|3gp|3g2)(\?|#|$)/i.test(url)

type Alignment = "left" | "centre" | "right" | "full"
const ALIGN_SET: Alignment[] = ["left", "centre", "right", "full"]

type Item = {
  url: string
  caption?: string
  link_type?: "internal" | "external"
  link_value?: string
  alignment: Alignment
}

type Row = { items: Item[] }

const tryParseArray = (raw: unknown): unknown[] => {
  if (Array.isArray(raw)) return raw
  if (typeof raw === "string") {
    const trimmed = raw.trim()
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) return parsed
      } catch {
        /* ignore */
      }
    }
    return trimmed.split(",").map((s) => s.trim()).filter(Boolean)
  }
  return []
}

const parseItem = (entry: unknown): Item | null => {
  if (typeof entry === "string") {
    return entry.trim() ? { url: entry, alignment: "left" } : null
  }
  if (entry && typeof entry === "object") {
    const r = entry as Record<string, unknown>
    if (typeof r.url !== "string") return null
    const lt =
      r.link_type === "internal" || r.link_type === "external"
        ? (r.link_type as "internal" | "external")
        : undefined
    const align =
      typeof r.alignment === "string" &&
      (ALIGN_SET as readonly string[]).includes(r.alignment)
        ? (r.alignment as Alignment)
        : "left"
    return {
      url: r.url,
      caption: typeof r.caption === "string" ? r.caption : undefined,
      link_type: lt,
      link_value: typeof r.link_value === "string" ? r.link_value : undefined,
      alignment: align,
    }
  }
  return null
}

const parseRows = (meta: Record<string, unknown> | null | undefined): Row[] => {
  const rawRows = meta?.editorial_rows
  const rowsArr = tryParseArray(rawRows)
  if (rowsArr.length) {
    const out: Row[] = []
    for (const entry of rowsArr) {
      const inner =
        entry && typeof entry === "object" && "items" in entry
          ? (entry as { items?: unknown }).items
          : entry
      const itemsArr = tryParseArray(inner)
      const items = itemsArr
        .map(parseItem)
        .filter((it): it is Item => it !== null)
      out.push({ items: items.slice(0, 3) })
    }
    if (out.length) return out
  }
  // Legacy: flat editorial_images → one item per row
  const flatArr = tryParseArray(meta?.editorial_images)
  const legacy: Row[] = []
  for (const entry of flatArr) {
    const it = parseItem(entry)
    if (it) legacy.push({ items: [it] })
  }
  return legacy
}

const slotClass = (a: Alignment) =>
  a === "centre"
    ? "small:col-start-2 small:col-end-3"
    : a === "right"
    ? "small:col-start-3 small:col-end-4"
    : a === "full"
    ? "small:col-start-1 small:col-end-4"
    : "small:col-start-1 small:col-end-2"

export default function EditorialTemplate({ collection }: EditorialTemplateProps) {
  const rows = parseRows(collection.metadata)

  const rawForSale = collection.metadata?.for_sale
  const forSale =
    rawForSale === true ||
    (typeof rawForSale === "string" && rawForSale.toLowerCase() === "true")

  return (
    <SixSpotGrid>
      <Spot id={2} rowSpan={3} className="min-w-0 bg-nj-bg p-2 pt-[var(--nj-band-bottom)] small:pt-2">
        <div className="flex flex-col gap-y-4">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-1 small:grid-cols-3 w-full gap-x-6 gap-y-4 small:gap-y-0">
              {row.items.length === 0 && (
                <div className="small:col-span-3 aspect-[3/1]" aria-hidden />
              )}
              {row.items.map((it, i) => {
                const href =
                  it.link_value && it.link_type === "internal"
                    ? `/products/${it.link_value}`
                    : it.link_value && it.link_type === "external"
                    ? it.link_value
                    : null
                const isExternal = it.link_type === "external"
                const media = isVideo(it.url) ? (
                  <video
                    src={it.url}
                    className="w-full h-auto block"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.url}
                    alt={it.caption || `${collection.title} ${rowIdx}-${i}`}
                    loading={rowIdx === 0 && i === 0 ? "eager" : "lazy"}
                    className="w-full h-auto block"
                  />
                )
                return (
                  <div
                    key={`${it.url}-${i}`}
                    className={`relative ${slotClass(it.alignment)}`}
                  >
                    {href ? (
                      isExternal ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="block"
                        >
                          {media}
                        </a>
                      ) : (
                        <LocalizedClientLink href={href} className="block">
                          {media}
                        </LocalizedClientLink>
                      )
                    ) : (
                      media
                    )}
                    {!!it.caption && (
                      <div className="absolute bottom-2 left-2 right-2 text-[12px] tracking-wide text-nj-bg drop-shadow pointer-events-none">
                        {it.caption}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </Spot>

      <Spot
        id={3}
        className="hidden small:flex fixed top-[var(--nj-band-top)] left-0 h-[var(--nj-band-h)] w-[var(--nj-col1)] small:left-[18px] small:w-[calc(var(--nj-col1)-18px)] z-20 pointer-events-none"
      >
        <h1 className="nj-band-title">
          {collection.title}
        </h1>
      </Spot>

      <Spot
        id={5}
        className="fixed top-[var(--nj-band-bottom)] left-0 bottom-0 small:bottom-[18px] w-[var(--nj-col1)] small:left-[18px] small:w-[calc(var(--nj-col1)-18px)] z-20 hidden small:flex flex-col justify-end text-[14px] small:text-[12px] leading-tight"
      >
        {!!collection.metadata?.description && (
          <p className="mb-4 max-w-[500px] whitespace-pre-line pr-24">
            {String(collection.metadata.description)}
          </p>
        )}
      </Spot>

      {forSale && (
        <div className="fixed top-[var(--nj-band-bottom)] left-0 w-[var(--nj-col1)] small:left-[18px] small:w-[calc(var(--nj-col1)-18px)] z-20 hidden small:flex justify-end p-2 text-[12px] tracking-wide pointer-events-none">
          <LocalizedClientLink
            href={`/collections/${collection.handle}/shop`}
            className="pointer-events-auto uppercase hover:italic"
          >
            shop the collection
          </LocalizedClientLink>
        </div>
      )}
    </SixSpotGrid>
  )
}
