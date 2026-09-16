import { Suspense } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import NavClient from "@modules/layout/components/nav-client"
import { listRegions } from "@lib/data/regions"

export default async function Nav() {
  const regions = await listRegions().catch(() => null)

  return (
    <>
    <div style={{ viewTransitionName: "nj-nav" }} className="fixed top-0 z-50 group w-full lg:w-4/12 xl:w-3/12 nj-fade-in-1">
      <header className="relative duration-200 w-full">
        <NavClient regions={regions}>
          <Suspense
            fallback={
              <LocalizedClientLink
                className="hover:italic hover:opacity-75 text-[14px] small:text-[12px] flex gap-2 bg-nj-bg bg-blur-sm"
                href="/cart"
                data-testid="nav-cart-link"
              >
                <div>Cart</div>
                <div>[0]</div>
                 
              </LocalizedClientLink>
            }
          >
            <CartButton />
          </Suspense>
        </NavClient>
      </header>
    </div>

    </>
  )
}
