"use client"

import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { useCartPanel } from "@modules/layout/components/nav-client/cart-context"
import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import CurrencySwitcher from "@modules/layout/components/currency-switcher"

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const { cartOpen: open, setCartOpen: setOpen, panelOpen, regions } = useCartPanel()

  const pathname = usePathname()

  const totalItems =
    cartState?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)

  // Auto-open cart dropdown when items change (not on cart page)
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      setOpen(true)
      const timer = setTimeout(() => setOpen(false), 5000)
      itemRef.current = totalItems
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems])

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={`hover:italic transition-all duration-300 text-[14px] small:text-[12px] uppercase text-left relative z-20 ${
          panelOpen ? "opacity-0 pointer-events-none" : ""
        }`}
        data-testid="nav-cart-link"
      >
        {`Cart [${totalItems}]`}
      </button>

      {/* Desktop only; mobile currency lives in the menu panel */}
      <CurrencySwitcher
        regions={regions}
        fallback={cartState?.currency_code?.toUpperCase() || "NZD"}
        className={`hidden small:block relative z-20 transition-all duration-300 ${
          panelOpen ? "opacity-0 pointer-events-none" : ""
        }`}
      />

      {/* Panel that slides down, same style as menu dropdown */}
      <div
        className={`fixed top-0 left-0 w-full md:w-[calc(50%+18px)] lg:w-[calc(33.3333%+18px)] xl:w-[calc(25%+18px)] z-10 transition-all duration-300 ease-in-out ${
          open
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-nj-main pt-48 p-2 small:px-[18px] flex flex-col text-nj-bg">
          {cartState && cartState.items?.length ? (
            <>
              <div className="overflow-y-auto max-h-[50vh] flex flex-col no-scrollbar">
                {cartState.items
                  .sort((a, b) =>
                    (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                  )
                  .map((item, index) => (
                    <div
                      className="flex items-start gap-x-4 border-b py-4"
                      key={item.id}
                      data-testid="cart-item"
                    >
                      {/* Quantity bracket */}
                      <span className="text-nj-bg text-[42px] leading-tight font-light shrink-0">
                        [{String(item.quantity).padStart(2, "0")}]
                      </span>

                      {/* Title + Price + Remove */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <LocalizedClientLink
                          href={`/products/${item.product_handle}`}
                          className="text-nj-bg leading-tight text-[24px] uppercase font-light"
                          onClick={() => setOpen(false)}
                        >
                          {item.title}
                        </LocalizedClientLink>
                        <div className="flex items-center justify-between">
                          <LineItemPrice
                            item={item}
                            style="tight"
                            currencyCode={cartState.currency_code}
                          />
                          <DeleteButton
                            id={item.id}
                            className="text-[14px] small:text-[12px]   "
                            data-testid="cart-item-remove-button"
                          >
                            Remove
                          </DeleteButton>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="mt-auto pt-24 flex flex-col gap-y-1 text-[14px] small:text-[12px] ">
                <div className="flex">
                  <span className="w-28 italic">Shipping:</span>
                  <span>Estimated at checkout</span>
                </div>
                <div className="flex">
                  <span className="w-28 italic">Total:</span>
                  <span data-testid="cart-subtotal" data-value={subtotal}>
                    {convertToLocale({
                      amount: subtotal,
                      currency_code: cartState.currency_code,
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-12 flex items-end justify-end ">
                {/* <span className="text-nj-bg text-[42px] leading-tight font-light">
                  [{String(totalItems).padStart(2, "0")}]
                </span> */}
                <LocalizedClientLink
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className=" text-nj-bg text-[32px] hover:italic    transition-colors"
                >
                  Check out
                </LocalizedClientLink>
              </div>
            </>
          ) : (
            <div className="">
              <p className="text-nj-bg leading-tight text-[42px] uppercase font-light  text">
                Your bag is empty
              </p>
             
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CartDropdown
