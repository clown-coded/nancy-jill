import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { SixSpotGrid, Spot } from "@modules/layout/components/six-spot-grid"
import StoreFilters from "@modules/store/components/filters"
import { listCollections } from "@lib/data/collections"
import { listProductTypes } from "@lib/data/product-types"

import PaginatedProducts, { fetchPaginatedProducts } from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  collectionHandle,
  typeValue,
  inStock,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  collectionHandle?: string
  typeValue?: string
  inStock?: boolean
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  const [{ collections }, types] = await Promise.all([
    listCollections({ fields: "id,handle,title" }),
    listProductTypes(),
  ])

  const collection = collectionHandle
    ? collections.find((c) => c.handle === collectionHandle)
    : undefined
  const type = typeValue ? types.find((t) => t.value === typeValue) : undefined
  const collectionId = collection?.id
  const typeId = type?.id

  const hasFilter = !!(collection || type || inStock)

  const { products, count, region } = await fetchPaginatedProducts({
    sortBy: sort,
    page: pageNumber,
    countryCode,
    collectionId,
    typeId,
    inStock,
  })

  const title = hasFilter
    ? products.length === 0
      ? "none"
      : "a few"
    : "all"

  return (
    <SixSpotGrid>
      <Spot
        id={3}
        className="hidden small:flex fixed top-[var(--nj-band-top)] left-0 h-[var(--nj-band-h)] w-[var(--nj-col1)] small:left-[18px] small:w-[calc(var(--nj-col1)-18px)] z-20 pointer-events-none"
      >
        <h1
          data-testid="store-page-title"
          className="nj-band-title uppercase"
        >
          {title}
        </h1>
      </Spot>
      <StoreFilters collections={collections} types={types} />
      <Spot id={2} rowSpan={3} className="min-w-0">
        <div className="pt-[var(--nj-band-bottom)] w-full">
          {region && (
            <PaginatedProducts
              products={products}
              count={count}
              page={pageNumber}
              region={region}
            />
          )}
        </div>
      </Spot>
    </SixSpotGrid>
  )
}

export default StoreTemplate
