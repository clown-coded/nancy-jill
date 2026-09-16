"use client"

import { createContext, useContext } from "react"
import { HttpTypes } from "@medusajs/types"

type CartPanelContextType = {
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  panelOpen: boolean
  regions: HttpTypes.StoreRegion[] | null
}

const CartPanelContext = createContext<CartPanelContextType>({
  cartOpen: false,
  setCartOpen: () => {},
  panelOpen: false,
  regions: null,
})

export const useCartPanel = () => useContext(CartPanelContext)

export function CartPanelProvider({
  children,
  cartOpen,
  setCartOpen,
  panelOpen,
  regions,
}: {
  children: React.ReactNode
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  panelOpen: boolean
  regions: HttpTypes.StoreRegion[] | null
}) {
  return (
    <CartPanelContext.Provider value={{ cartOpen, setCartOpen, panelOpen, regions }}>
      {children}
    </CartPanelContext.Provider>
  )
}
