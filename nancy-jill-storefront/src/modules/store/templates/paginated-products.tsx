import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  type_id?: string[]
  id?: string[]
  order?: string
}

export async function fetchPaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  typeId,
  productsIds,
  inStock,
  countryCode,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  typeId?: string
  productsIds?: string[]
  inStock?: boolean
  countryCode: string
}): Promise<{
  products: HttpTypes.StoreProduct[]
  count: number
  region: HttpTypes.StoreRegion | null
}> {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (collectionId) queryParams["collection_id"] = [collectionId]
  if (categoryId) queryParams["category_id"] = [categoryId]
  if (typeId) queryParams["type_id"] = [typeId]
  if (productsIds) queryParams["id"] = productsIds
  if (sortBy === "created_at") queryParams["order"] = "created_at"

  const region = await getRegion(countryCode)
  if (!region) return { products: [], count: 0, region: null }

  let {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })

  if (inStock) {
    products = products.filter((p) =>
      p.variants?.some(
        (v) =>
          !v.manage_inventory ||
          v.allow_backorder ||
          (v.inventory_quantity || 0) > 0
      )
    )
  }

  return { products, count, region }
}

export default function PaginatedProducts({
  products,
  count,
  page,
  region,
}: {
  products: HttpTypes.StoreProduct[]
  count: number
  page: number
  region: HttpTypes.StoreRegion
}) {
  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <>
      <ul
        className="flex flex-wrap justify-start gap-6 w-full"
        data-testid="products-list"
      >
        {products.map((p) => (
          <li key={p.id} className="w-[280px]">
            <ProductPreview product={p} region={region} />
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
