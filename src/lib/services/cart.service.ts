import { apiClient } from "@/lib/api-client"
import type { Cart, CartResponse, PromoPreview } from "@/types"

function mapCartResponse(dto: CartResponse): Cart {
  return { id: dto.id, items: dto.items, subtotal: dto.subtotal }
}

export async function getCart(): Promise<Cart> {
  const { data } = await apiClient.get<CartResponse>("/cart")
  return mapCartResponse(data)
}

export async function addCartItem(payload: {
  productId: string
  variantId?: string
  quantity?: number
}): Promise<Cart> {
  const { data } = await apiClient.post<CartResponse>("/cart/items", payload)
  return mapCartResponse(data)
}

export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  const { data } = await apiClient.put<CartResponse>(`/cart/items/${itemId}`, { quantity })
  return mapCartResponse(data)
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const { data } = await apiClient.delete<CartResponse>(`/cart/items/${itemId}`)
  return mapCartResponse(data)
}

export async function clearCart(): Promise<void> {
  await apiClient.delete("/cart")
}

export async function getPromoPreview(code: string): Promise<PromoPreview> {
  const { data } = await apiClient.get<PromoPreview>("/cart/promo-preview", { params: { code } })
  return data
}
