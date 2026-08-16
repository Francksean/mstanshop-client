export type CategorySlug =
  | "vetements-afro"
  | "vetements-classiques"
  | "bijoux"
  | "tissus-pagne"
  | "sacs"

export interface Category {
  slug: CategorySlug
  name: string
  /** Real backend id — present when the category came from the live API (used for admin CRUD/filtering). */
  id?: string
  description?: string
  bannerUrl?: string | null
  thumbnailUrl?: string | null
  promoActive?: boolean
  promoDiscountType?: "PERCENTAGE" | "FIXED_AMOUNT"
  promoDiscountValue?: number
  promoEndsAt?: string | null
}

export interface ProductColor {
  name: string
  hex: string
}

export interface ProductImage {
  id: string
  url: string
  thumbnail: boolean
  /** Set when this image belongs to a specific color variant rather than the base product. */
  variantId?: string
}

export interface ProductVariant {
  id: string
  colorName?: string
  colorHex: string
  /** Free-form, e.g. "S", "M", "40" — empty string when this product has no notion of size. */
  size?: string
  stock: number
  active: boolean
  images: ProductImage[]
}

export interface Product {
  id: string
  name: string
  slug: string
  /** Backend categories are free-form (uuid-backed); mock data uses the fixed CategorySlug set. */
  category: CategorySlug | string
  categoryId?: string
  /** Only present on the admin/detail view — the public catalog has no notion of suppliers. */
  supplierId?: string
  supplierName?: string
  price: number
  /** Backend `oldPrice` — set only when a category promotion is active; `price` is already the discounted amount actually charged. */
  compareAtPrice?: number
  description: string
  materials: string
  careInstructions: string
  images: ProductImage[]
  /** Unique, non-empty `size` values across `variants`. */
  sizes: string[]
  /** Derived from `variants` (name + hex) when the product has color variants. */
  colors: ProductColor[]
  variants: ProductVariant[]
  /** Sum of variant stocks when the product has variants, otherwise the simple product stock. */
  stock: number
  active: boolean
  isFeatured: boolean
  averageRating: number | null
  reviewCount: number
  createdAt: string
}

export interface ProductShareResponse {
  url: string
  title: string
  description?: string
  imageUrl?: string
}

export type SortOption = "newest" | "price-asc" | "price-desc"

export interface ProductQueryParams {
  page?: number
  limit?: number
  category?: CategorySlug
  /** Real-backend category ids to filter by — sent as repeated `categoryId` query params (`?categoryId=a&categoryId=b`). */
  categoryIds?: string[]
  search?: string
  minPrice?: number
  maxPrice?: number
  colors?: string[]
  sort?: SortOption
  featured?: boolean
}
