import type { OrderPaymentMethod, OrderStatus, PaymentStatus } from "./order"
import type { ProductVariant } from "./product"
import type { DiscountType } from "./promo"
import type { UserRole } from "./user"

/** Shape of `PUT .../variants/{id}` — updates one already-existing size/color row. */
export interface VariantRequest {
  colorName?: string
  /** Omit (or `null`) for a size-only variant — no color declination. */
  colorHex?: string
  size?: string
  stock: number
  active?: boolean
}

/** Shape of `POST .../variants` (standalone) and `ProductRequest.variants` — creates one row per size, all sharing the same initial stock. */
export interface VariantCreateRequest {
  colorName?: string
  /** Omit (or `null`) for a size-only variant — no color declination. */
  colorHex?: string
  sizes: string[]
  stock: number
  active?: boolean
}

export interface ProductRequest {
  name: string
  description?: string
  price: number
  /** Admin-only, informational, never subject to promotions. */
  purchasePrice?: number
  stock: number
  categoryId: string
  active?: boolean
  supplierId?: string
  /** Only meaningful on creation — pre-uploaded via `uploadToR2` with a throwaway client-generated entityId (no productId exists yet). */
  images?: { objectKey: string; markAsThumbnail?: boolean }[]
  /** Only meaningful on creation — variants can't be attached to images yet at this point (no productId); add variant photos afterwards via the edit view. */
  variants?: VariantCreateRequest[]
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
  /** Admin-only — absent (not null) from the JSON entirely for non-admin requests. */
  purchasePrice?: number
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
  /** Admin-only — absent (not null) from the JSON entirely for non-admin requests. */
  purchasePrice?: number
  stock: number
  categoryName: string
  thumbnailUrl?: string
  averageRating: number | null
  reviewCount: number
}

export interface CategoryRequest {
  name: string
  description?: string
  /** `null` clears the parent (root category); omit to leave unchanged. */
  parentId?: string | null
}

export interface CategoryResponse {
  id: string
  name: string
  slug: string
  description?: string
  bannerUrl?: string | null
  thumbnailUrl?: string | null
  /** Single-level hierarchy — a category with a parentId can't itself have children. */
  parentId?: string | null
  parentName?: string | null
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

export interface DashboardSummary {
  revenue: number
  orderCount: number
  averageBasket: number
  pendingOrders: number
  lowStockCount: number
  newNewsletterSubscribers: number
}

export interface RevenueTimeseriesPoint {
  date: string
  revenue: number
  orderCount: number
}

export interface OrdersByStatusEntry {
  status: OrderStatus
  count: number
}

export interface PaymentBreakdownEntry {
  method: OrderPaymentMethod
  status: PaymentStatus
  count: number
  amount: number
}

export interface TopProductEntry {
  productId: string
  productName: string
  quantitySold: number
  revenue: number
}

export interface TopCategoryEntry {
  categoryId: string
  categoryName: string
  quantitySold: number
  revenue: number
}

export interface PromoUsageEntry {
  code: string
  usesCount: number
  totalDiscount: number
}
