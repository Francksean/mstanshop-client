import { apiClient } from "@/lib/api-client"
import type { LowStockItem, ProductDetailResponse, ProductRequest } from "@/types"

export async function createProduct(payload: ProductRequest): Promise<ProductDetailResponse> {
  const { data } = await apiClient.post<ProductDetailResponse>("/admin/products", payload)
  return data
}

export async function updateProduct(
  id: string,
  payload: ProductRequest
): Promise<ProductDetailResponse> {
  const { data } = await apiClient.put<ProductDetailResponse>(`/admin/products/${id}`, payload)
  return data
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/admin/products/${id}`)
}

export async function getLowStockItems(): Promise<LowStockItem[]> {
  const { data } = await apiClient.get<LowStockItem[]>("/admin/products/low-stock")
  return data
}
