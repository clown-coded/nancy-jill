import { Text } from "@medusajs/ui"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
  index,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  /** When set, a mobile caption row is rendered under the image: [01] TITLE */
  index?: number
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div data-testid="product-wrapper">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
          className="opacity-75 group-hover:opacity-100 transition-opacity"
        />
        {index != null && (
          <div className="small:hidden flex items-baseline gap-x-1.5 pt-1 text-[6px] leading-[8px]">
            <span className="shrink-0">
              [{(index + 1).toString().padStart(2, "0")}]
            </span>
            <span className="uppercase truncate">{product.title}</span>
          </div>
        )}
        <div className="hidden small:flex opacity-0 group-hover:opacity-100 transition-opacity flex-col items-start pt-1 leading-[14px] text-[10px]">
          <Text className="uppercase leading-5" data-testid="product-title">
            {product.title}
          </Text>
          {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
