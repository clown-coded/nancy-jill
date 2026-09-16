import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info" className="flex flex-col">
      <Heading
        level="h2"
        className="text-[32px] lg:text-[48px] uppercase lg:leading-10"
        data-testid="product-title"
      >
        {product.title}
      </Heading>
    </div>
  )
}

export default ProductInfo
