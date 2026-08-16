export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT"

export interface PromoCode {
  id: string
  code: string
  discountType: DiscountType
  discountValue: number
  expiresAt?: string
  minOrderAmount?: number
  maxUses?: number
  usesCount: number
  active: boolean
}

export interface PromoCodeRequest {
  code: string
  discountType: DiscountType
  discountValue: number
  expiresAt?: string
  minOrderAmount?: number
  maxUses?: number
  active?: boolean
}
