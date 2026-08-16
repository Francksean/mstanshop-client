import { apiClient } from "@/lib/api-client"
import type { CreateReviewPayload, PagedResponse, Pageable, Review } from "@/types"

export async function getReviews(
  productId: string,
  pageable: Pageable = {}
): Promise<PagedResponse<Review>> {
  const { data } = await apiClient.get<PagedResponse<Review>>(`/products/${productId}/reviews`, {
    params: { page: pageable.page ?? 0, size: pageable.size ?? 10 },
  })
  return data
}

export async function createReview(productId: string, payload: CreateReviewPayload): Promise<Review> {
  const { data } = await apiClient.post<Review>(`/products/${productId}/reviews`, payload)
  return data
}
