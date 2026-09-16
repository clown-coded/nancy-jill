import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { Button, Container, Heading, Input, Text, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"

type ProductWithMeta = AdminProduct & {
  metadata?: Record<string, unknown> | null
}

const FIXED_KEYS = ["fit", "care", "material"] as const

const isFixedKey = (k: string) =>
  (FIXED_KEYS as readonly string[]).includes(k.toLowerCase())

const toFixed = (
  meta: Record<string, unknown> | null | undefined
): Record<string, string> => {
  const out: Record<string, string> = {}
  FIXED_KEYS.forEach((k) => {
    let v: unknown = undefined
    if (meta) {
      const entry = Object.entries(meta).find(
        ([mk]) => mk.toLowerCase() === k
      )
      if (entry) v = entry[1]
    }
    out[k] = v == null ? "" : String(v)
  })
  return out
}

const ProductDetailsAttributesWidget = ({
  data,
}: DetailWidgetProps<ProductWithMeta>) => {
  const [fixed, setFixed] = useState<Record<string, string>>(toFixed(data.metadata))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setFixed(toFixed(data.metadata))
  }, [data])

  const persist = async (nextFixed: Record<string, string>) => {
    setSaving(true)
    try {
      const existing = data.metadata ?? {}
      const next_meta: Record<string, unknown> = { ...existing }

      // Null out any existing case-variant keys for the fixed fields (e.g. "Fit", "Care")
      Object.keys(existing).forEach((k) => {
        if (isFixedKey(k)) next_meta[k] = null
      })

      // Write canonical lowercase keys
      FIXED_KEYS.forEach((k) => {
        next_meta[k] = nextFixed[k] ?? ""
      })

      const res = await fetch(`/admin/products/${data.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: next_meta }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success("Saved")
    } catch (e: any) {
      toast.error(e?.message || "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Details attributes</Heading>
        <Button
          size="small"
          disabled={saving}
          onClick={() => persist(fixed)}
        >
          Save
        </Button>
      </div>
      <div className="px-6 py-4 flex flex-col gap-y-3">
        {FIXED_KEYS.map((k) => (
          <div key={k} className="grid grid-cols-[1fr_2fr] gap-x-2 items-center">
            <Text size="small" weight="plus" className="capitalize">
              {k}
            </Text>
            <Input
              placeholder={k}
              value={fixed[k] ?? ""}
              onChange={(e) =>
                setFixed((prev) => ({ ...prev, [k]: e.target.value }))
              }
            />
          </div>
        ))}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductDetailsAttributesWidget
