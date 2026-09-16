"use server"

import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

type ProductType = { id: string; value: string }

export const listProductTypes = async (): Promise<ProductType[]> => {
  const next = {
    ...(await getCacheOptions("product-types")),
  }

  return sdk.client
    .fetch<{ product_types: ProductType[] }>("/store/product-types", {
      query: { limit: 100, offset: 0 },
      next,
      cache: "force-cache",
    })
    .then(({ product_types }) => product_types || [])
    .catch(() => [])
}
