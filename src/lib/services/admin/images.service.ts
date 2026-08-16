import { apiClient } from "@/lib/api-client"
import type { ProductImageResponse } from "@/types"

export async function uploadProductImages(
  productId: string,
  files: File[],
  options: { markFirstAsThumbnail?: boolean; variantId?: string } = {}
): Promise<ProductImageResponse[]> {
  const formData = new FormData()
  for (const file of files) {
    formData.append("files", file)
  }
  const { data } = await apiClient.post<ProductImageResponse[]>(
    `/admin/products/${productId}/images`,
    formData,
    {
      params: {
        markFirstAsThumbnail: options.markFirstAsThumbnail,
        variantId: options.variantId,
      },
      headers: { "Content-Type": "multipart/form-data" },
    }
  )
  return data
}

export async function deleteProductImage(productId: string, imageId: string): Promise<void> {
  await apiClient.delete(`/admin/products/${productId}/images/${imageId}`)
}
