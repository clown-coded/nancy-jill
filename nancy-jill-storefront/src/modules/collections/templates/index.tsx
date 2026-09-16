import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts, {
  fetchPaginatedProducts,
} from "@modules/store/templates/paginated-products"
import { SixSpotGrid, Spot } from "@modules/layout/components/six-spot-grid"
import { HttpTypes } from "@medusajs/types"

export default async function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  const { products, count, region } = await fetchPaginatedProducts({
    sortBy: sort,
    page: pageNumber,
    collectionId: collection.id,
    countryCode,
  })

  return (
    <SixSpotGrid>
      <Spot
        id={3}
        className="hidden small:flex fixed top-[var(--nj-band-top)] left-0 h-[var(--nj-band-h)] w-[var(--nj-col1)] small:left-[18px] small:w-[calc(var(--nj-col1)-18px)] z-20 pointer-events-none"
      >
        <h1
          data-testid="collection-page-title"
          className="nj-band-title uppercase"
        >
          {collection.title}
        </h1>
      </Spot>
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
