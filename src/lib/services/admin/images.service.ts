import { apiClient } from "@/lib/api-client"
import { uploadToR2 } from "./uploads.service"
import type { ProductImageResponse } from "@/types"

async function uploadProductImage(
  productId: string,
  file: File,
  options: { markAsThumbnail?: boolean; variantId?: string } = {}
): Promise<ProductImageResponse> {
  const { objectKey } = await uploadToR2("PRODUCT_IMAGE", productId, file)
  const { data } = await apiClient.post<ProductImageResponse>(`/admin/products/${productId}/images/confirm`, {
    objectKey,
    markAsThumbnail: options.markAsThumbnail ?? false,
    variantId: options.variantId ?? null,
  })
  return data
}

export async function uploadProductImages(
  productId: string,
  files: File[],
  options: { markFirstAsThumbnail?: boolean; variantId?: string } = {}
): Promise<ProductImageResponse[]> {
  const results: ProductImageResponse[] = []
  for (let i = 0; i < files.length; i++) {
    results.push(
      await uploadProductImage(productId, files[i], {
        markAsThumbnail: Boolean(options.markFirstAsThumbnail) && i === 0,
        variantId: options.variantId,
      })
    )
  }
  return results
}

export async function deleteProductImage(productId: string, imageId: string): Promise<void> {
  await apiClient.delete(`/admin/products/${productId}/images/${imageId}`)
}
