import type { OrderStatus } from "./order"
import type { ProductVariant } from "./product"
import type { DiscountType } from "./promo"
import type { UserRole } from "./user"

export interface ProductRequest {
  name: string
  description?: string
  price: number
  stock: number
  categoryId: string
  active?: boolean
  supplierId?: string
}

export interface ProductImageResponse {
  id: string
  url: string
  thumbnail: boolean
  variantId?: string
}

export interface ProductDetailResponse {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  /** Nullable — present only when a category promotion is currently active on this product. */
  oldPrice?: number | null
  stock: number
  active: boolean
  categoryId: string
  categoryName: string
  images: ProductImageResponse[]
  variants: ProductVariant[]
  averageRating: number | null
  reviewCount: number
  supplierId?: string | null
  supplierName?: string | null
}

export interface ProductResponse {
  id: string
  name: string
  slug: string
  price: number
  /** Nullable — present only when a category promotion is currently active on this product. */
  oldPrice?: number | null
  stock: number
  categoryName: string
  thumbnailUrl?: string
  averageRating: number | null
  reviewCount: number
}

export interface CategoryRequest {
  name: string
  description?: string
}

export interface CategoryResponse {
  id: string
  name: string
  slug: string
  description?: string
  bannerUrl?: string | null
  thumbnailUrl?: string | null
  promoActive?: boolean
  promoDiscountType?: DiscountType
  promoDiscountValue?: number
  promoEndsAt?: string | null
}

export interface CategoryPromotionRequest {
  discountType: DiscountType
  discountValue: number
  startsAt?: string
  endsAt?: string
  active: boolean
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus
}

export interface AdminUserResponse {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  createdAt: string
}

export interface UpdateUserRoleRequest {
  role: UserRole
}

export interface LowStockItem {
  productId: string
  productName: string
  variantId?: string
  variantColorName?: string
  variantSize?: string
  currentStock: number
  threshold: number
}
