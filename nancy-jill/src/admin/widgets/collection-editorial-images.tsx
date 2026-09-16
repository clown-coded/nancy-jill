import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminCollection } from "@medusajs/framework/types"
import {
  Button,
  Container,
  Heading,
  Input,
  Select,
  Switch,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useEffect, useRef, useState } from "react"

type CollectionWithMeta = AdminCollection & {
  metadata?: Record<string, unknown> | null
}

type LinkType = "internal" | "external"
type Alignment = "left" | "centre" | "right" | "full"
const ALIGNMENTS: Alignment[] = ["left", "centre", "right", "full"]

type EditorialItem = {
  url: string
  caption?: string
  link_type?: LinkType
  link_value?: string
  alignment?: Alignment
}

type EditorialRow = {
  items: EditorialItem[]
}

const isVideo = (url: string) =>
  /\.(mp4|webm|mov|m4v|ogv|ogg|avi|mkv|mpeg|mpg|qt|flv|3gp|3g2)(\?|$)/i.test(url)

const parseItem = (entry: unknown): EditorialItem | null => {
  if (typeof entry === "string") {
    return entry.trim() ? { url: entry, alignment: "left" } : null
  }
  if (entry && typeof entry === "object") {
    const r = entry as Record<string, unknown>
    if (typeof r.url !== "string") return null
    const lt =
      r.link_type === "internal" || r.link_type === "external"
        ? (r.link_type as LinkType)
        : undefined
    const align =
      typeof r.alignment === "string" &&
      (ALIGNMENTS as readonly string[]).includes(r.alignment)
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

const parseRows = (
  meta: Record<string, unknown> | null | undefined
): EditorialRow[] => {
  // Prefer editorial_rows; fall back to editorial_images (flat) where each entry becomes its own row
  const rawRows = meta?.editorial_rows
  const rowsArr = tryParseArray(rawRows)
  if (rowsArr.length) {
    const out: EditorialRow[] = []
    for (const entry of rowsArr) {
      const inner = (entry && typeof entry === "object" && "items" in entry)
        ? (entry as { items?: unknown }).items
        : entry
      const itemsArr = tryParseArray(inner)
      const items = itemsArr
        .map(parseItem)
        .filter((it): it is EditorialItem => it !== null)
      out.push({ items: items.slice(0, 3) })
    }
    if (out.length) return out
  }
  // Legacy: editorial_images flat array → one item per row
  const flatArr = tryParseArray(meta?.editorial_images)
  const legacy: EditorialRow[] = []
  for (const entry of flatArr) {
    const it = parseItem(entry)
    if (it) legacy.push({ items: [it] })
  }
  return legacy
}

const parseFlatItems = (
  meta: Record<string, unknown> | null | undefined
): EditorialItem[] => {
  const arr = tryParseArray(meta?.editorial_images)
  const out: EditorialItem[] = []
  for (const entry of arr) {
    const it = parseItem(entry)
    if (it) out.push(it)
  }
  return out
}

const CollectionEditorialImagesWidget = ({
  data,
}: DetailWidgetProps<CollectionWithMeta>) => {
  const [rows, setRows] = useState<EditorialRow[]>(parseRows(data.metadata))
  const [items, setItems] = useState<EditorialItem[]>(parseFlatItems(data.metadata))
  const [description, setDescription] = useState<string>(
    typeof data.metadata?.description === "string" ? data.metadata.description : ""
  )
  const [layout, setLayout] = useState<string>(
    typeof data.metadata?.layout === "string" ? data.metadata.layout : "editorial"
  )
  const [homepage1, setHomepage1] = useState<string>(
    typeof data.metadata?.homepage_media_1 === "string" ? data.metadata.homepage_media_1 : ""
  )
  const [homepage2, setHomepage2] = useState<string>(
    typeof data.metadata?.homepage_media_2 === "string" ? data.metadata.homepage_media_2 : ""
  )
  const [homepage3, setHomepage3] = useState<string>(
    typeof data.metadata?.homepage_media_3 === "string" ? data.metadata.homepage_media_3 : ""
  )
  const [forSale, setForSale] = useState<boolean>(
    data.metadata?.for_sale === true ||
      (typeof data.metadata?.for_sale === "string" &&
        data.metadata.for_sale.toLowerCase() === "true")
  )
  const [uploadingRowSlot, setUploadingRowSlot] = useState<string | null>(null)
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [productOptions, setProductOptions] = useState<
    { handle: string; title: string }[]
  >([])
  const [drag, setDrag] = useState<{ row: number; slot: number } | null>(null)
  const flatFileInputRef = useRef<HTMLInputElement>(null)
  const [flatDragIdx, setFlatDragIdx] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(
          "/admin/products?fields=handle,title&limit=200",
          { credentials: "include" }
        )
        if (!res.ok) return
        const json = (await res.json()) as {
          products: { handle: string | null; title: string }[]
        }
        if (cancelled) return
        setProductOptions(
          json.products
            .filter((p) => typeof p.handle === "string" && p.handle.length)
            .map((p) => ({ handle: p.handle as string, title: p.title }))
            .sort((a, b) => a.title.localeCompare(b.title))
        )
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setRows(parseRows(data.metadata))
    setItems(parseFlatItems(data.metadata))
    setDescription(
      typeof data.metadata?.description === "string" ? data.metadata.description : ""
    )
    setLayout(
      typeof data.metadata?.layout === "string" ? data.metadata.layout : "editorial"
    )
    setHomepage1(
      typeof data.metadata?.homepage_media_1 === "string" ? data.metadata.homepage_media_1 : ""
    )
    setHomepage2(
      typeof data.metadata?.homepage_media_2 === "string" ? data.metadata.homepage_media_2 : ""
    )
    setHomepage3(
      typeof data.metadata?.homepage_media_3 === "string" ? data.metadata.homepage_media_3 : ""
    )
    setForSale(
      data.metadata?.for_sale === true ||
        (typeof data.metadata?.for_sale === "string" &&
          data.metadata.for_sale.toLowerCase() === "true")
    )
  }, [data])

  const persist = async (overrides: {
    editorial_rows?: EditorialRow[]
    editorial_images?: EditorialItem[]
    description?: string
    layout?: string
    homepage_media_1?: string
    homepage_media_2?: string
    homepage_media_3?: string
    for_sale?: boolean
  } = {}) => {
    setSaving(true)
    try {
      const next_rows =
        overrides.editorial_rows !== undefined ? overrides.editorial_rows : rows
      const next_items =
        overrides.editorial_images !== undefined
          ? overrides.editorial_images
          : items
      const metadata: Record<string, unknown> = {
        ...(data.metadata ?? {}),
        editorial_rows: next_rows,
        editorial_images: next_items,
        description:
          overrides.description !== undefined ? overrides.description : description,
        layout: overrides.layout !== undefined ? overrides.layout : layout,
        homepage_media_1:
          overrides.homepage_media_1 !== undefined
            ? overrides.homepage_media_1
            : homepage1,
        homepage_media_2:
          overrides.homepage_media_2 !== undefined
            ? overrides.homepage_media_2
            : homepage2,
        homepage_media_3:
          overrides.homepage_media_3 !== undefined
            ? overrides.homepage_media_3
            : homepage3,
        for_sale:
          overrides.for_sale !== undefined ? overrides.for_sale : forSale,
      }
      const res = await fetch(`/admin/collections/${data.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success("Saved")
    } catch (e: any) {
      toast.error(e?.message || "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const uploadFiles = async (files: FileList | null): Promise<string[]> => {
    if (!files || files.length === 0) return []
    const form = new FormData()
    Array.from(files).forEach((f) => form.append("files", f))
    const res = await fetch("/admin/uploads", {
      method: "POST",
      credentials: "include",
      body: form,
    })
    if (!res.ok) throw new Error(await res.text())
    const { files: uploaded } = (await res.json()) as {
      files: { id: string; url: string }[]
    }
    return uploaded.map((u) => u.url)
  }

  // Row operations
  const addRow = async () => {
    const next = [...rows, { items: [] }]
    setRows(next)
    await persist({ editorial_rows: next })
  }

  const removeRow = async (rowIdx: number) => {
    const next = rows.filter((_, i) => i !== rowIdx)
    setRows(next)
    await persist({ editorial_rows: next })
  }

  const moveRow = async (from: number, to: number) => {
    if (to < 0 || to >= rows.length) return
    const next = [...rows]
    const [r] = next.splice(from, 1)
    next.splice(to, 0, r)
    setRows(next)
    await persist({ editorial_rows: next })
  }

  // Slot operations — represent slot by position (left/centre/right). Items inside row are an array;
  // a slot is derived from an item's alignment (left/centre/right) OR if full, the row has only one item.
  const slotOrder: Alignment[] = ["left", "centre", "right"]

  const getItemInSlot = (
    row: EditorialRow,
    slot: Alignment
  ): { item: EditorialItem; index: number } | null => {
    // If any item is full, treat it as occupying every slot
    const fullIdx = row.items.findIndex((it) => it.alignment === "full")
    if (fullIdx !== -1) return { item: row.items[fullIdx], index: fullIdx }
    const idx = row.items.findIndex((it) => (it.alignment ?? "left") === slot)
    if (idx === -1) return null
    return { item: row.items[idx], index: idx }
  }

  const setRows_ = (next: EditorialRow[]) => {
    setRows(next)
  }

  const handleSlotUpload = async (
    rowIdx: number,
    slot: Alignment,
    file: File | null | undefined
  ) => {
    if (!file) return
    const key = `${rowIdx}-${slot}`
    setUploadingRowSlot(key)
    try {
      const urls = await uploadFiles(
        ({ 0: file, length: 1 } as unknown) as FileList
      )
      const url = urls[0]
      if (!url) throw new Error("Upload returned no url")
      const next = rows.map((r, i) => {
        if (i !== rowIdx) return r
        // Replace existing item in that slot (or add a new one)
        const existing = r.items.findIndex(
          (it) => (it.alignment ?? "left") === slot
        )
        const newItem: EditorialItem = { url, alignment: slot }
        if (existing !== -1) {
          const newItems = r.items.slice()
          newItems[existing] = { ...newItems[existing], url }
          return { items: newItems }
        }
        // Don't allow adding to slot if a full item exists; remove the full first
        const filtered = r.items.filter((it) => it.alignment !== "full")
        return { items: [...filtered, newItem] }
      })
      setRows_(next)
      await persist({ editorial_rows: next })
    } catch (e: any) {
      toast.error(e?.message || "Upload failed")
    } finally {
      setUploadingRowSlot(null)
    }
  }

  const updateItem = (
    rowIdx: number,
    itemIdx: number,
    patch: Partial<EditorialItem>
  ) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== rowIdx) return r
        const items = r.items.map((it, j) =>
          j === itemIdx ? { ...it, ...patch } : it
        )
        return { items }
      })
    )
  }

  const saveRows = async () => {
    await persist({ editorial_rows: rows })
  }

  const removeItemFromSlot = async (rowIdx: number, slot: Alignment) => {
    const next = rows.map((r, i) => {
      if (i !== rowIdx) return r
      const fullIdx = r.items.findIndex((it) => it.alignment === "full")
      if (fullIdx !== -1) {
        return { items: r.items.filter((_, j) => j !== fullIdx) }
      }
      return {
        items: r.items.filter((it) => (it.alignment ?? "left") !== slot),
      }
    })
    setRows(next)
    await persist({ editorial_rows: next })
  }

  const setAlignment = async (
    rowIdx: number,
    itemIdx: number,
    align: Alignment
  ) => {
    const next = rows.map((r, i) => {
      if (i !== rowIdx) return r
      if (align === "full") {
        // Make this item full; drop all others
        const target = r.items[itemIdx]
        return { items: [{ ...target, alignment: "full" as Alignment }] }
      }
      // Otherwise set alignment; if any other item already has that alignment, swap their alignments
      const updated = r.items.map((it, j) => {
        if (j === itemIdx) return { ...it, alignment: align }
        return it
      })
      const conflicts = updated.filter(
        (it, j) => j !== itemIdx && (it.alignment ?? "left") === align
      )
      if (conflicts.length) {
        const previousAlign = r.items[itemIdx].alignment ?? "left"
        return {
          items: updated.map((it, j) =>
            j !== itemIdx && (it.alignment ?? "left") === align
              ? { ...it, alignment: previousAlign }
              : it
          ),
        }
      }
      return { items: updated }
    })
    setRows(next)
    await persist({ editorial_rows: next })
  }

  // Drag-drop between slots / rows
  const handleSlotDrop = async (rowIdx: number, slot: Alignment) => {
    if (!drag) return
    if (drag.row === rowIdx) {
      // Same row: swap alignments
      const r = rows[rowIdx]
      const draggedItem = r.items[drag.slot]
      if (!draggedItem) return
      await setAlignment(rowIdx, drag.slot, slot)
    } else {
      // Move item from one row to another
      const fromRow = rows[drag.row]
      const item = fromRow.items[drag.slot]
      if (!item) return
      const next = rows.map((r, i) => {
        if (i === drag.row) {
          return { items: r.items.filter((_, j) => j !== drag.slot) }
        }
        if (i === rowIdx) {
          const newItem: EditorialItem = { ...item, alignment: slot }
          const filtered = r.items.filter(
            (it) =>
              (it.alignment ?? "left") !== slot && it.alignment !== "full"
          )
          return { items: [...filtered, newItem] }
        }
        return r
      })
      setRows(next)
      await persist({ editorial_rows: next })
    }
    setDrag(null)
  }

  const uploadSingle = async (file: File): Promise<string> => {
    const form = new FormData()
    form.append("files", file)
    const res = await fetch("/admin/uploads", {
      method: "POST",
      credentials: "include",
      body: form,
    })
    if (!res.ok) throw new Error(await res.text())
    const { files: uploaded } = (await res.json()) as {
      files: { id: string; url: string }[]
    }
    return uploaded[0]?.url
  }

  // ----- Notebook (flat items) operations -----
  const handleItemsUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    try {
      const urls = await uploadFiles(files)
      const newItems: EditorialItem[] = urls.map((u) => ({ url: u }))
      const next = [...items, ...newItems]
      setItems(next)
      await persist({ editorial_images: next })
    } catch (e: any) {
      toast.error(e?.message || "Upload failed")
    }
  }

  const removeItem = async (i: number) => {
    const next = items.filter((_, idx) => idx !== i)
    setItems(next)
    await persist({ editorial_images: next })
  }

  const removeAllItems = async () => {
    setItems([])
    await persist({ editorial_images: [] })
  }

  const moveItem = async (from: number, to: number) => {
    if (to < 0 || to >= items.length) return
    const next = [...items]
    const [it] = next.splice(from, 1)
    next.splice(to, 0, it)
    setItems(next)
    await persist({ editorial_images: next })
  }

  const updateFlatItem = (i: number, patch: Partial<EditorialItem>) => {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  }

  const saveItems = async () => {
    await persist({ editorial_images: items })
  }

  const handleHomepageUpload = async (
    slot: 1 | 2 | 3,
    file: File | null | undefined
  ) => {
    if (!file) return
    setUploadingSlot(slot)
    try {
      const url = await uploadSingle(file)
      if (!url) throw new Error("Upload returned no url")
      if (slot === 1) {
        setHomepage1(url)
        await persist({ homepage_media_1: url })
      } else if (slot === 2) {
        setHomepage2(url)
        await persist({ homepage_media_2: url })
      } else {
        setHomepage3(url)
        await persist({ homepage_media_3: url })
      }
    } catch (e: any) {
      toast.error(e?.message || "Upload failed")
    } finally {
      setUploadingSlot(null)
    }
  }

  const clearHomepage = async (slot: 1 | 2 | 3) => {
    if (slot === 1) {
      setHomepage1("")
      await persist({ homepage_media_1: "" })
    } else if (slot === 2) {
      setHomepage2("")
      await persist({ homepage_media_2: "" })
    } else {
      setHomepage3("")
      await persist({ homepage_media_3: "" })
    }
  }

  const renderHomepageSlot = (slot: 1 | 2 | 3, url: string, label: string) => (
    <div className="flex flex-col gap-y-2">
      <Text size="small" weight="plus">
        {label}
      </Text>
      {url ? (
        <div className="flex flex-col gap-y-1">
          {isVideo(url) ? (
            <video
              src={url}
              className="w-full h-40 object-cover rounded border"
              muted
              playsInline
              controls
            />
          ) : (
            <img
              src={url}
              alt=""
              className="w-full h-40 object-cover rounded border"
            />
          )}
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] underline break-all text-ui-fg-subtle"
          >
            {url}
          </a>
          <Button
            size="small"
            variant="danger"
            onClick={() => clearHomepage(slot)}
          >
            Remove
          </Button>
        </div>
      ) : (
        <Text size="small" className="text-ui-fg-subtle">
          None.
        </Text>
      )}
      <input
        type="file"
        accept="image/*,video/*"
        disabled={uploadingSlot === slot}
        onChange={(e) => handleHomepageUpload(slot, e.target.files?.[0])}
      />
      {uploadingSlot === slot && <Text size="small">Uploading...</Text>}
    </div>
  )

  const renderSlot = (rowIdx: number, slot: Alignment) => {
    const row = rows[rowIdx]
    const found = getItemInSlot(row, slot)
    const isFull =
      found?.item.alignment === "full" && slot !== "left" ? true : false
    if (found && found.item.alignment === "full" && slot !== "left") {
      // The "full" item is displayed in the left slot; skip rendering in centre/right
      return null
    }
    const item = found?.item
    const itemIdx = found?.index ?? -1
    const colSpan =
      item?.alignment === "full" ? "col-span-3" : "col-span-1"
    const uploadKey = `${rowIdx}-${slot}`
    return (
      <div
        key={`${rowIdx}-${slot}`}
        className={`${colSpan} border rounded p-2 min-h-[160px] flex flex-col gap-y-2 ${
          drag && drag.row === rowIdx && drag.slot === itemIdx
            ? "opacity-50"
            : ""
        }`}
        onDragOver={(e) => {
          if (drag) e.preventDefault()
        }}
        onDrop={() => handleSlotDrop(rowIdx, slot)}
      >
        {item ? (
          <>
            <div
              draggable
              onDragStart={() => setDrag({ row: rowIdx, slot: itemIdx })}
              onDragEnd={() => setDrag(null)}
              className="relative cursor-move"
            >
              {isVideo(item.url) ? (
                <video
                  src={item.url}
                  className="w-full h-32 object-cover rounded pointer-events-none"
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={item.url}
                  alt=""
                  className="w-full h-32 object-cover rounded pointer-events-none"
                />
              )}
              <div className="absolute top-1 left-1 text-[10px] uppercase bg-white/80 px-1 rounded">
                {slot}
                {item.alignment === "full" ? " · full" : ""}
              </div>
            </div>
            <Input
              placeholder="Caption (optional)"
              value={item.caption ?? ""}
              onChange={(e) =>
                updateItem(rowIdx, itemIdx, { caption: e.target.value })
              }
              onBlur={saveRows}
            />
            {row.items.length === 1 && (
              <Button
                size="small"
                variant="secondary"
                onClick={() =>
                  setAlignment(
                    rowIdx,
                    itemIdx,
                    item.alignment === "full" ? slot : "full"
                  )
                }
              >
                {item.alignment === "full" ? "Make partial" : "Make full"}
              </Button>
            )}
            <Select
              value={item.link_type ?? "none"}
              onValueChange={(v) => {
                if (v === "none") {
                  updateItem(rowIdx, itemIdx, {
                    link_type: undefined,
                    link_value: undefined,
                  })
                } else {
                  updateItem(rowIdx, itemIdx, { link_type: v as LinkType })
                }
                saveRows()
              }}
            >
              <Select.Trigger>
                <Select.Value placeholder="Link type" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="none">No link</Select.Item>
                <Select.Item value="internal">Internal (product)</Select.Item>
                <Select.Item value="external">External URL</Select.Item>
              </Select.Content>
            </Select>
            {item.link_type === "internal" && (
              <Select
                value={item.link_value ?? ""}
                onValueChange={(v) => {
                  updateItem(rowIdx, itemIdx, { link_value: v })
                  saveRows()
                }}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Choose product" />
                </Select.Trigger>
                <Select.Content>
                  {productOptions.map((p) => (
                    <Select.Item key={p.handle} value={p.handle}>
                      {p.title}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
            {item.link_type === "external" && (
              <Input
                placeholder="https://example.com"
                value={item.link_value ?? ""}
                onChange={(e) =>
                  updateItem(rowIdx, itemIdx, { link_value: e.target.value })
                }
                onBlur={saveRows}
              />
            )}
            <Button
              size="small"
              variant="danger"
              onClick={() => removeItemFromSlot(rowIdx, slot)}
            >
              Remove
            </Button>
          </>
        ) : (
          <label className="flex-1 flex items-center justify-center text-[12px] text-ui-fg-subtle cursor-pointer border border-dashed rounded">
            {uploadingRowSlot === uploadKey ? "Uploading..." : `+ Add (${slot})`}
            <input
              type="file"
              accept="image/*,video/*"
              hidden
              onChange={(e) =>
                handleSlotUpload(rowIdx, slot, e.target.files?.[0])
              }
            />
          </label>
        )}
      </div>
    )
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Editorial</Heading>
      </div>
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          <Text size="small" weight="plus">
            For sale
          </Text>
          <Text size="small" className="text-ui-fg-subtle">
            Show "Shop the collection" link on the storefront
          </Text>
        </div>
        <Switch
          checked={forSale}
          onCheckedChange={(checked) => {
            setForSale(checked)
            persist({ for_sale: checked })
          }}
        />
      </div>
      <div className="px-6 py-4 flex flex-col gap-y-3">
        <Text size="small" weight="plus">
          Layout
        </Text>
        <Select
          value={layout}
          onValueChange={(value) => {
            setLayout(value)
            persist({ layout: value })
          }}
        >
          <Select.Trigger>
            <Select.Value placeholder="Choose layout" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="editorial">Editorial</Select.Item>
            <Select.Item value="notebook">Notebook</Select.Item>
          </Select.Content>
        </Select>
      </div>
      <div className="px-6 py-4 flex flex-col gap-y-3">
        <Text size="small" weight="plus">
          Description
        </Text>
        <Textarea
          value={description}
          rows={8}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => persist({ description })}
          placeholder="Collection description shown on storefront"
        />
        <div>
          <Button
            size="small"
            variant="secondary"
            disabled={saving}
            onClick={() => persist({ description })}
          >
            Save description
          </Button>
        </div>
      </div>
      <div className="px-6 py-4 flex flex-col gap-y-4">
        <Text size="small" weight="plus">
          Homepage media (1 = big, 2 & 3 = small)
        </Text>
        <div className="grid grid-cols-3 gap-3">
          {renderHomepageSlot(1, homepage1, "1 — big")}
          {renderHomepageSlot(2, homepage2, "2 — small")}
          {renderHomepageSlot(3, homepage3, "3 — small")}
        </div>
      </div>
      {layout === "editorial" ? (
        <div className="px-6 py-4 flex flex-col gap-y-4">
          <div className="flex items-center justify-between">
            <Text size="small" weight="plus">
              Editorial rows
            </Text>
            <Button size="small" variant="secondary" onClick={addRow}>
              Add row
            </Button>
          </div>
          {rows.length === 0 ? (
            <Text size="small" className="text-ui-fg-subtle">
              No rows yet. Click "Add row" to start.
            </Text>
          ) : (
            <div className="flex flex-col gap-y-4">
              {rows.map((_, rowIdx) => (
                <div
                  key={rowIdx}
                  className="border rounded p-3 flex flex-col gap-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Text size="small" weight="plus">
                      Row {rowIdx + 1}
                    </Text>
                    <div className="flex gap-x-1">
                      <Button
                        size="small"
                        variant="secondary"
                        disabled={rowIdx === 0}
                        onClick={() => moveRow(rowIdx, rowIdx - 1)}
                      >
                        ↑
                      </Button>
                      <Button
                        size="small"
                        variant="secondary"
                        disabled={rowIdx === rows.length - 1}
                        onClick={() => moveRow(rowIdx, rowIdx + 1)}
                      >
                        ↓
                      </Button>
                      <Button
                        size="small"
                        variant="danger"
                        onClick={() => removeRow(rowIdx)}
                      >
                        Remove row
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {slotOrder.map((slot) => renderSlot(rowIdx, slot))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="px-6 py-4 flex flex-col gap-y-3">
          <div className="flex items-center justify-between">
            <Text size="small" weight="plus">
              Campaign images
            </Text>
            <div className="flex gap-x-2">
              <Button
                size="small"
                variant="secondary"
                onClick={() => flatFileInputRef.current?.click()}
              >
                Add media
              </Button>
              {items.length > 0 && (
                <Button size="small" variant="danger" onClick={removeAllItems}>
                  Remove all
                </Button>
              )}
            </div>
          </div>
          <input
            ref={flatFileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            hidden
            onChange={(e) => {
              handleItemsUpload(e.target.files)
              e.target.value = ""
            }}
          />
          {items.length === 0 ? (
            <Text size="small" className="text-ui-fg-subtle">
              No media yet.
            </Text>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {items.map((it, i) => (
                <div
                  key={`${it.url}-${i}`}
                  draggable
                  onDragStart={() => setFlatDragIdx(i)}
                  onDragEnter={() => {
                    if (flatDragIdx !== null && flatDragIdx !== i) {
                      moveItem(flatDragIdx, i)
                      setFlatDragIdx(i)
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnd={() => setFlatDragIdx(null)}
                  className={`border rounded p-2 flex flex-col gap-y-2 ${
                    flatDragIdx === i ? "opacity-50" : ""
                  }`}
                >
                  {isVideo(it.url) ? (
                    <video
                      src={it.url}
                      className="w-full h-40 object-cover rounded pointer-events-none cursor-move"
                      muted
                      playsInline
                      controls
                    />
                  ) : (
                    <img
                      src={it.url}
                      alt=""
                      className="w-full h-40 object-cover rounded pointer-events-none cursor-move"
                    />
                  )}
                  <Input
                    placeholder="Caption (optional)"
                    value={it.caption ?? ""}
                    onChange={(e) =>
                      updateFlatItem(i, { caption: e.target.value })
                    }
                    onBlur={saveItems}
                  />
                  <Select
                    value={it.link_type ?? "none"}
                    onValueChange={(v) => {
                      if (v === "none") {
                        updateFlatItem(i, {
                          link_type: undefined,
                          link_value: undefined,
                        })
                      } else {
                        updateFlatItem(i, { link_type: v as LinkType })
                      }
                      saveItems()
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Link type" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="none">No link</Select.Item>
                      <Select.Item value="internal">Internal (product)</Select.Item>
                      <Select.Item value="external">External URL</Select.Item>
                    </Select.Content>
                  </Select>
                  {it.link_type === "internal" && (
                    <Select
                      value={it.link_value ?? ""}
                      onValueChange={(v) => {
                        updateFlatItem(i, { link_value: v })
                        saveItems()
                      }}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Choose product" />
                      </Select.Trigger>
                      <Select.Content>
                        {productOptions.map((p) => (
                          <Select.Item key={p.handle} value={p.handle}>
                            {p.title}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  )}
                  {it.link_type === "external" && (
                    <Input
                      placeholder="https://example.com"
                      value={it.link_value ?? ""}
                      onChange={(e) =>
                        updateFlatItem(i, { link_value: e.target.value })
                      }
                      onBlur={saveItems}
                    />
                  )}
                  <div className="flex gap-x-1">
                    <Button
                      size="small"
                      variant="secondary"
                      disabled={i === 0}
                      onClick={() => moveItem(i, i - 1)}
                    >
                      ↑
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      disabled={i === items.length - 1}
                      onClick={() => moveItem(i, i + 1)}
                    >
                      ↓
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => removeItem(i)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product_collection.details.after",
})

export default CollectionEditorialImagesWidget
