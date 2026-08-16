import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface GuestCartItem {
  productId: string
  variantId?: string
  productName: string
  productThumbnailUrl?: string
  variantColorName?: string
  variantColorHex?: string
  variantSize?: string
  unitPrice: number
  quantity: number
}

export function guestCartItemKey(productId: string, variantId?: string): string {
  return `${productId}::${variantId ?? ""}`
}

interface GuestCartState {
  items: GuestCartItem[]
  addItem: (item: Omit<GuestCartItem, "quantity"> & { quantity?: number }) => void
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void
  removeItem: (productId: string, variantId: string | undefined) => void
  clearCart: () => void
}

export const useGuestCartStore = create<GuestCartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const quantity = item.quantity ?? 1
          const key = guestCartItemKey(item.productId, item.variantId)
          const existing = state.items.find((i) => guestCartItemKey(i.productId, i.variantId) === key)
          if (existing) {
            return {
              items: state.items.map((i) =>
                guestCartItemKey(i.productId, i.variantId) === key
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity }] }
        }),

      updateQuantity: (productId, variantId, quantity) =>
        set((state) => {
          const key = guestCartItemKey(productId, variantId)
          return {
            items: state.items.map((i) =>
              guestCartItemKey(i.productId, i.variantId) === key
                ? { ...i, quantity: Math.max(1, quantity) }
                : i
            ),
          }
        }),

      removeItem: (productId, variantId) =>
        set((state) => {
          const key = guestCartItemKey(productId, variantId)
          return { items: state.items.filter((i) => guestCartItemKey(i.productId, i.variantId) !== key) }
        }),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "mstanshop-guest-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
)
