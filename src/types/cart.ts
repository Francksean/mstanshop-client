export interface CartItem {
  id: string
  productId: string
  productName: string
  productThumbnailUrl?: string
  variantId?: string
  variantColorName?: string
  variantColorHex?: string
  variantSize?: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
}

/** Backend `CartItemResponse`/`CartResponse`. */
export interface CartItemResponse {
  id: string
  productId: string
  productName: string
  productThumbnailUrl?: string
  variantId?: string
  variantColorName?: string
  variantColorHex?: string
  variantSize?: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface CartResponse {
  id: string
  items: CartItemResponse[]
  subtotal: number
}

/** Backend `GET /api/cart/promo-preview?code=...` — always 200, `valid` carries the outcome. */
export interface PromoPreview {
  code: string
  valid: boolean
  reason: string | null
  subtotal: number
  discountAmount: number
  totalAmount: number
}
