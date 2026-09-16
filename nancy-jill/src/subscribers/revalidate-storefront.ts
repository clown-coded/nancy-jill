import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

const STOREFRONT_URL = process.env.STOREFRONT_URL || "http://localhost:8000"
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET || "supersecret"

export default async function revalidateStorefrontHandler({
  event,
}: SubscriberArgs<Record<string, unknown>>) {
  const tags = ["products", "collections", "categories"]

  try {
    await fetch(`${STOREFRONT_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": REVALIDATION_SECRET,
      },
      body: JSON.stringify({ tags }),
    })
  } catch (error) {
    console.error("Failed to revalidate storefront:", error)
  }
}

export const config: SubscriberConfig = {
  event: [
    "product.created",
    "product.updated",
    "product.deleted",
    "product-category.created",
    "product-category.updated",
    "product-category.deleted",
  ],
}
