import { create } from "zustand"
import * as cartService from "@/lib/services/cart.service"
import type { CartItem } from "@/types"

interface CartState {
  items: CartItem[]
  subtotal: number
  isLoading: boolean
  hasLoaded: boolean
  isDrawerOpen: boolean

  fetchCart: () => Promise<void>
  addItem: (payload: { productId: string; variantId?: string; quantity?: number }) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  /** Drops the in-memory server cart so the next mount refetches — used on login/logout. */
  reset: () => void

  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  subtotal: 0,
  isLoading: false,
  hasLoaded: false,
  isDrawerOpen: false,

  fetchCart: async () => {
    if (get().isLoading) return
    set({ isLoading: true })
    try {
      const cart = await cartService.getCart()
      set({ items: cart.items, subtotal: cart.subtotal, hasLoaded: true })
    } finally {
      set({ isLoading: false })
    }
  },

  addItem: async (payload) => {
    const cart = await cartService.addCartItem(payload)
    set({ items: cart.items, subtotal: cart.subtotal, hasLoaded: true })
  },

  updateQuantity: async (itemId, quantity) => {
    const cart = await cartService.updateCartItem(itemId, quantity)
    set({ items: cart.items, subtotal: cart.subtotal })
  },

  removeItem: async (itemId) => {
    const cart = await cartService.removeCartItem(itemId)
    set({ items: cart.items, subtotal: cart.subtotal })
  },

  clearCart: async () => {
    await cartService.clearCart()
    set({ items: [], subtotal: 0 })
  },

  reset: () => set({ items: [], subtotal: 0, hasLoaded: false }),

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
}))
