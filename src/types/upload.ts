export type UploadScope = "PRODUCT_IMAGE" | "CATEGORY_BANNER" | "CATEGORY_THUMBNAIL"

export interface PresignUploadRequest {
  scope: UploadScope
  entityId: string
  fileName: string
  contentType: string
}

export interface PresignUploadResponse {
  uploadUrl: string
  objectKey: string
  publicUrl: string
  expiresAt: string
}

export interface ConfirmProductImageRequest {
  objectKey: string
  markAsThumbnail?: boolean
  variantId?: string | null
}

export interface ConfirmCategoryImageRequest {
  objectKey: string
}
