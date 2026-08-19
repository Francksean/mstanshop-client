import { apiClient } from "@/lib/api-client"
import type { ProductVariant, VariantCreateRequest, VariantRequest } from "@/types"

export async function listVariants(productId: string): Promise<ProductVariant[]> {
  const { data } = await apiClient.get<ProductVariant[]>(`/admin/products/${productId}/variants`)
  return data
}

/** One row is created per entry in `payload.sizes`, all sharing the same initial stock. */
export async function createVariant(
  productId: string,
  payload: VariantCreateRequest
): Promise<ProductVariant[]> {
  const { data } = await apiClient.post<ProductVariant[]>(
    `/admin/products/${productId}/variants`,
    payload
  )
  return data
}

export async function updateVariant(
  productId: string,
  variantId: string,
  payload: VariantRequest
): Promise<ProductVariant> {
  const { data } = await apiClient.put<ProductVariant>(
    `/admin/products/${productId}/variants/${variantId}`,
    payload
  )
  return data
}

export async function deleteVariant(productId: string, variantId: string): Promise<void> {
  await apiClient.delete(`/admin/products/${productId}/variants/${variantId}`)
}
