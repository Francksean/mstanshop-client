import axios from "axios"
import { apiClient } from "@/lib/api-client"
import type { PresignUploadResponse, UploadScope } from "@/types"

const ACCEPTED_CONTENT_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"]

async function presignUpload(payload: {
  scope: UploadScope
  entityId: string
  fileName: string
  contentType: string
}): Promise<PresignUploadResponse> {
  const { data } = await apiClient.post<PresignUploadResponse>("/admin/uploads/presign", payload)
  return data
}

/**
 * Uploads a file straight from the browser to R2 via a presigned URL (never touches our
 * backend): presign -> PUT direct to R2 -> return the objectKey for the caller to confirm.
 * Uses a bare axios call (not `apiClient`) since the presigned URL is already fully
 * authorized — it must NOT carry our Authorization header, and it's an absolute R2 URL,
 * not a backend API path.
 */
export async function uploadToR2(
  scope: UploadScope,
  entityId: string,
  file: File
): Promise<{ objectKey: string; publicUrl: string }> {
  const contentType = file.type
  if (!ACCEPTED_CONTENT_TYPES.includes(contentType)) {
    throw new Error(`Format d'image non supporté (${contentType || "inconnu"}). Formats acceptés : PNG, JPEG, WEBP, GIF.`)
  }

  const { uploadUrl, objectKey, publicUrl } = await presignUpload({
    scope,
    entityId,
    fileName: file.name,
    contentType,
  })

  await axios.put(uploadUrl, file, { headers: { "Content-Type": contentType } })

  return { objectKey, publicUrl }
}
