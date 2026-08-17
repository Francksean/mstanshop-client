import { apiClient } from "@/lib/api-client"
import { uploadToR2 } from "./uploads.service"
import type { CategoryPromotionRequest, CategoryRequest, CategoryResponse } from "@/types"

export async function createCategory(payload: CategoryRequest): Promise<CategoryResponse> {
  const { data } = await apiClient.post<CategoryResponse>("/admin/categories", payload)
  return data
}

export async function updateCategory(
  id: string,
  payload: CategoryRequest
): Promise<CategoryResponse> {
  const { data } = await apiClient.put<CategoryResponse>(`/admin/categories/${id}`, payload)
  return data
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/admin/categories/${id}`)
}

async function uploadCategoryImage(id: string, kind: "banner" | "thumbnail", file: File): Promise<void> {
  const scope = kind === "banner" ? "CATEGORY_BANNER" : "CATEGORY_THUMBNAIL"
  const { objectKey } = await uploadToR2(scope, id, file)
  await apiClient.post(`/admin/categories/${id}/${kind}/confirm`, { objectKey })
}

export function uploadCategoryBanner(id: string, file: File): Promise<void> {
  return uploadCategoryImage(id, "banner", file)
}

export function uploadCategoryThumbnail(id: string, file: File): Promise<void> {
  return uploadCategoryImage(id, "thumbnail", file)
}

export async function setCategoryPromotion(
  id: string,
  payload: CategoryPromotionRequest
): Promise<CategoryResponse> {
  const { data } = await apiClient.put<CategoryResponse>(`/admin/categories/${id}/promotion`, payload)
  return data
}

export async function removeCategoryPromotion(id: string): Promise<void> {
  await apiClient.delete(`/admin/categories/${id}/promotion`)
}
