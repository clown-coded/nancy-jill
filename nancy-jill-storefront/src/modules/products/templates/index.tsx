import React from "react"

import ImageGalleryWithCounter from "@modules/products/components/image-gallery/with-counter"
import ProductActions from "@modules/products/components/product-actions"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import ProductPrice from "@modules/products/components/product-price"
import MobileBand from "@modules/products/components/mobile-band"
import { getProductPrice } from "@lib/util/get-product-price"
import { SixSpotGrid, Spot } from "@modules/layout/components/six-spot-grid"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const { cheapestPrice } = getProductPrice({ product })

  return (
    <>
      <SixSpotGrid>
        <Spot id={2} rowSpan={3} className="min-w-0">
          <ImageGalleryWithCounter images={product?.images || []} />

          {/* Mobile: title + price directly under the gallery */}
          <div id="product-mobile-title" className="small:hidden px-2 pt-4 pb-8">
            <ProductInfo product={product} />
            <ProductPrice product={product} />
          </div>

          {/* Section: description — pins for 1 viewport, then releases */}
          <div id="product-description-section" className="h-[calc(var(--nj-vh)*2)] small:h-[200vh]">
            <div className="sticky top-0 h-[var(--nj-vh)] small:h-screen overflow-hidden w-4/6 small:w-auto px-2 pt-[calc(var(--nj-band-bottom)+48px)] pb-8 small:pb-16 small:pt-[calc(var(--nj-band-bottom)+8px)] text-[14px] small:text-[12px] leading-tight pr-2 small:pr-24 small:flex small:flex-col">
              <div data-testid="product-description" className="[&>p+p]:mt-[1.25em] small:columns-2 small:gap-12 small:[column-fill:auto] small:flex-1 small:min-h-0">
                {(product.description || "")
                  .split(/\n+/)
                  .filter((para) => para.trim())
                  .map((para, i) => (
                    <p key={i} className="indent-[2em]">
                      {para}
                    </p>
                  ))}
              </div>
            </div>
          </div>

          {/* Section: details — pins for 1 viewport, then releases */}
          {product.metadata &&
            Object.entries(product.metadata).filter(
              ([_, value]) => value != null && value !== ""
            ).length > 0 && (
              <div id="product-details-section" className="h-[calc(var(--nj-vh)*2)] small:h-[200vh]">
                <div className="sticky top-0 h-[var(--nj-vh)] small:h-screen overflow-hidden w-4/6 small:w-auto px-2 pt-[calc(var(--nj-band-bottom)+48px)] pb-8 small:pb-0 small:pt-[calc(var(--nj-band-bottom)+8px)] text-[14px] small:text-[12px] leading-tight pr-2 small:pr-24">
                  <dl className="grid grid-cols-[auto_1fr] gap-y-1 gap-x-3">
                    {Object.entries(product.metadata)
                      .filter(([_, value]) => value != null && value !== "")
                      .map(([key, value]) => (
                        <React.Fragment key={key}>
                          <dt className="italic">{key} :</dt>
                          <dd>{String(value)}</dd>
                        </React.Fragment>
                      ))}
                  </dl>
                </div>
              </div>
            )}

          {/* Section: related products — pins for 1 viewport, then releases */}
          <div id="related-products" className="h-[calc(var(--nj-vh)*2)] small:h-[200vh]">
            <div className="sticky top-0 h-[var(--nj-vh)] small:h-screen overflow-hidden px-2 pt-[calc(var(--nj-band-bottom)+48px)] pb-8 small:pb-16 small:pt-[calc(var(--nj-band-bottom)+8px)] text-[14px] small:text-[12px] leading-tight pr-2 small:pr-24">
              <RelatedProducts product={product} countryCode={countryCode} />
            </div>
          </div>
        </Spot>
        {product.collection && (
          <Spot
            id={3}
            className="hidden small:flex fixed top-[var(--nj-band-top)] left-0 h-[var(--nj-band-h)] w-[var(--nj-col1)] small:left-[18px] small:w-[calc(var(--nj-col1)-18px)] z-20 p-2"
          >
            <h1 className="text-[12px] tracking-wide leading-none m-0 p-0">
              {product.collection.title}
            </h1>
          </Spot>
        )}
        <MobileBand
          collectionTitle={product.collection?.title}
          productTitle={product.title}
          price={cheapestPrice?.calculated_price ?? null}
          watchId="product-mobile-title"
          relatedId="related-products"
        />

        <Spot
          id={5}
          className="fixed inset-x-0 bottom-0 small:bottom-[18px] top-auto w-auto small:top-[var(--nj-band-bottom)] small:inset-x-auto small:left-[18px] small:w-[calc(var(--nj-col1)-18px)] z-40 small:z-20 flex flex-col justify-end items-end small:items-stretch p-2 small:p-0"
        >
          <div className="hidden small:block">
            <ProductInfo product={product} />
          </div>
          <ProductActions product={product} region={region} />
        </Spot>
      </SixSpotGrid>
    </>
  )
}

export default ProductTemplate
