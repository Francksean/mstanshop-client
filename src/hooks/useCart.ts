"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { useCartStore } from "@/stores/useCartStore"
import { useGuestCartStore, guestCartItemKey, type GuestCartItem } from "@/stores/useGuestCartStore"
import { useAuthStore } from "@/stores/useAuthStore"
import { normalizeError } from "@/lib/api-error"
import type { CartItem } from "@/types"

export interface AddCartItemInput {
  productId: string
  variantId?: string
  quantity?: number
  /** Only used for the guest (local) cart — ignored once authenticated, since the server enriches the line. */
  productName: string
  unitPrice: number
  productThumbnailUrl?: string
  variantColorName?: string
  variantColorHex?: string
  variantSize?: string
}

function guestItemToCartItem(item: GuestCartItem): CartItem {
  return {
    id: guestCartItemKey(item.productId, item.variantId),
    productId: item.productId,
    productName: item.productName,
    productThumbnailUrl: item.productThumbnailUrl,
    variantId: item.variantId,
    variantColorName: item.variantColorName,
    variantColorHex: item.variantColorHex,
    variantSize: item.variantSize,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.unitPrice * item.quantity,
  }
}

function parseGuestItemId(id: string): { productId: string; variantId?: string } {
  const [productId, variantId] = id.split("::")
  return { productId, variantId: variantId || undefined }
}

export function useCart() {
  const t = useTranslations("apiErrors")
  const tCart = useTranslations("cart")
  const isAuthenticated = useAuthStore((s) => Boolean(s.user))

  const serverItems = useCartStore((s) => s.items)
  const serverSubtotal = useCartStore((s) => s.subtotal)
  const serverIsLoading = useCartStore((s) => s.isLoading)
  const serverHasLoaded = useCartStore((s) => s.hasLoaded)
  const fetchCart = useCartStore((s) => s.fetchCart)
  const storeAddItem = useCartStore((s) => s.addItem)
  const storeUpdateQuantity = useCartStore((s) => s.updateQuantity)
  const storeRemoveItem = useCartStore((s) => s.removeItem)
  const storeClearCart = useCartStore((s) => s.clearCart)

  const guestItems = useGuestCartStore((s) => s.items)
  const guestAddItem = useGuestCartStore((s) => s.addItem)
  const guestUpdateQuantity = useGuestCartStore((s) => s.updateQuantity)
  const guestRemoveItem = useGuestCartStore((s) => s.removeItem)
  const guestClearCart = useGuestCartStore((s) => s.clearCart)

  const isDrawerOpen = useCartStore((s) => s.isDrawerOpen)
  const openDrawer = useCartStore((s) => s.openDrawer)
  const closeDrawer = useCartStore((s) => s.closeDrawer)
  const toggleDrawer = useCartStore((s) => s.toggleDrawer)

  useEffect(() => {
    if (isAuthenticated && !serverHasLoaded) {
      fetchCart().catch((err) => toast.error(normalizeError(err, t).message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, serverHasLoaded, fetchCart])

  const items: CartItem[] = isAuthenticated ? serverItems : guestItems.map(guestItemToCartItem)
  const subtotal = isAuthenticated
    ? serverSubtotal
    : guestItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  async function addItem(payload: AddCartItemInput) {
    try {
      if (isAuthenticated) {
        await storeAddItem({ productId: payload.productId, variantId: payload.variantId, quantity: payload.quantity })
      } else {
        guestAddItem({
          productId: payload.productId,
          variantId: payload.variantId,
          quantity: payload.quantity,
          productName: payload.productName,
          unitPrice: payload.unitPrice,
          productThumbnailUrl: payload.productThumbnailUrl,
          variantColorName: payload.variantColorName,
          variantColorHex: payload.variantColorHex,
          variantSize: payload.variantSize,
        })
      }
      toast.success(tCart("addedToCart"))
    } catch (err) {
      toast.error(normalizeError(err, t).message)
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    try {
      if (isAuthenticated) {
        await storeUpdateQuantity(itemId, quantity)
      } else {
        const { productId, variantId } = parseGuestItemId(itemId)
        guestUpdateQuantity(productId, variantId, quantity)
      }
    } catch (err) {
      toast.error(normalizeError(err, t).message)
    }
  }

  async function removeItem(itemId: string) {
    try {
      if (isAuthenticated) {
        await storeRemoveItem(itemId)
      } else {
        const { productId, variantId } = parseGuestItemId(itemId)
        guestRemoveItem(productId, variantId)
      }
    } catch (err) {
      toast.error(normalizeError(err, t).message)
    }
  }

  async function clearCart() {
    try {
      if (isAuthenticated) {
        await storeClearCart()
      } else {
        guestClearCart()
      }
    } catch (err) {
      toast.error(normalizeError(err, t).message)
    }
  }

  return {
    items,
    subtotal,
    count,
    isLoading: isAuthenticated ? serverIsLoading : false,
    isDrawerOpen,
    isAuthenticated,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  }
}
