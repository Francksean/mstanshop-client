import { apiClient } from "@/lib/api-client"
import { getCategories } from "@/lib/services/categories.service"
import type {
  PagedResponse,
  PaginatedResult,
  Product,
  ProductDetailResponse,
  ProductQueryParams,
  ProductResponse,
  ProductShareResponse,
} from "@/types"

// The public list/search endpoint returns a slim ProductResponse (no
// description/materials/variants — those only exist on the detail
// endpoint). Fields absent from the list response get sane MVP defaults so
// existing components (ProductCard, ImagePlaceholder, etc.) work unchanged.
function mapProductResponse(dto: ProductResponse): Product {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    category: dto.categoryName,
    price: dto.price,
    compareAtPrice: dto.oldPrice ?? undefined,
    description: "",
    materials: "",
    careInstructions: "",
    images: dto.thumbnailUrl ? [{ id: dto.id, url: dto.thumbnailUrl, thumbnail: true }] : [],
    sizes: [],
    colors: [],
    variants: [],
    stock: dto.stock,
    // The public list endpoint only ever returns active products.
    active: true,
    isFeatured: false,
    averageRating: dto.averageRating,
    reviewCount: dto.reviewCount,
    createdAt: new Date().toISOString(),
  }
}

function mapProductDetailResponse(dto: ProductDetailResponse): Product {
  const colors = Array.from(
    new Map(dto.variants.map((v) => [v.colorHex, { name: v.colorName ?? v.colorHex, hex: v.colorHex }])).values()
  )
  const sizes = Array.from(new Set(dto.variants.map((v) => v.size).filter((s): s is string => Boolean(s))))
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    category: dto.categoryName,
    categoryId: dto.categoryId,
    supplierId: dto.supplierId ?? undefined,
    supplierName: dto.supplierName ?? undefined,
    price: dto.price,
    compareAtPrice: dto.oldPrice ?? undefined,
    description: dto.description ?? "",
    materials: "",
    careInstructions: "",
    images: dto.images,
    sizes,
    colors,
    variants: dto.variants,
    stock: dto.stock,
    active: dto.active,
    isFeatured: false,
    averageRating: dto.averageRating,
    reviewCount: dto.reviewCount,
    createdAt: new Date().toISOString(),
  }
}

async function resolveCategoryId(slug: string | undefined): Promise<string | undefined> {
  if (!slug) return undefined
  const categories = await getCategories()
  return categories.find((c) => c.slug === slug)?.id
}

export async function getProducts(params: ProductQueryParams): Promise<PaginatedResult<Product>> {
  const page = params.page ?? 1
  const limit = params.limit ?? 8

  // Axios repeats the key for each array entry (`categoryId=a&categoryId=b`),
  // matching the backend's multi-value contract for this filter.
  const categoryIds = params.categoryIds?.length
    ? params.categoryIds
    : await resolveCategoryId(params.category).then((id) => (id ? [id] : undefined))
  const { data } = await apiClient.get<PagedResponse<ProductResponse>>("/products", {
    params: {
      query: params.search,
      categoryId: categoryIds,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      page: page - 1,
      size: limit,
    },
  })

  return {
    items: data.content.map(mapProductResponse),
    page: data.page + 1,
    limit: data.size,
    total: data.totalElements,
    hasMore: !data.last,
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data } = await apiClient.get<ProductDetailResponse>(`/products/${id}`)
  return mapProductDetailResponse(data)
}

export async function getProductShareInfo(id: string): Promise<ProductShareResponse> {
  const { data } = await apiClient.get<ProductShareResponse>(`/products/${id}/share`)
  return data
}

export async function getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
  // No dedicated "related products" endpoint in the spec — derive it from
  // the current product's category via the public search endpoint.
  const current = await getProductById(productId)
  if (!current) return []
  const { data } = await apiClient.get<PagedResponse<ProductResponse>>("/products", {
    params: { categoryId: current.categoryId, page: 0, size: limit + 1 },
  })
  return data.content.map(mapProductResponse).filter((p) => p.id !== productId).slice(0, limit)
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  // No dedicated "featured" endpoint in the spec — surface the most recent products instead.
  const { data } = await apiClient.get<PagedResponse<ProductResponse>>("/products", {
    params: { page: 0, size: limit },
  })
  return data.content.map(mapProductResponse)
}
