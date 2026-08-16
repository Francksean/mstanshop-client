import { apiClient } from "@/lib/api-client"
import type { ProductVariant } from "@/types"

export interface VariantRequest {
  colorName?: string
  colorHex: string
  size?: string
  stock: number
  active?: boolean
}

export async function listVariants(productId: string): Promise<ProductVariant[]> {
  const { data } = await apiClient.get<ProductVariant[]>(`/admin/products/${productId}/variants`)
  return data
}

export async function createVariant(
  productId: string,
  payload: VariantRequest
): Promise<ProductVariant> {
  const { data } = await apiClient.post<ProductVariant>(
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
