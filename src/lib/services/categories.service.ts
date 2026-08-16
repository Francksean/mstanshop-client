import { apiClient } from "@/lib/api-client"
import type { Category, CategoryResponse } from "@/types"

// Real backend categories are free-form (uuid-backed); the app's CategorySlug
// union only models the five fixed mock categories used by the catalog
// filters. Casting here is a deliberate, documented liberty — `slug` on a
// real-mode Category is only ever used for display/keys/hrefs, never
// exhaustively switched over.
function mapCategoryResponse(dto: CategoryResponse): Category {
  return {
    id: dto.id,
    slug: dto.slug as Category["slug"],
    name: dto.name,
    description: dto.description,
    bannerUrl: dto.bannerUrl,
    thumbnailUrl: dto.thumbnailUrl,
    promoActive: dto.promoActive,
    promoDiscountType: dto.promoDiscountType,
    promoDiscountValue: dto.promoDiscountValue,
    promoEndsAt: dto.promoEndsAt,
  }
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<CategoryResponse[]>("/categories")
  return data.map(mapCategoryResponse)
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const { data } = await apiClient.get<CategoryResponse>(`/categories/${id}`)
  return mapCategoryResponse(data)
}
