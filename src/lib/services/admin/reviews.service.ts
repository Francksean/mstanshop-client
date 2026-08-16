import { apiClient } from "@/lib/api-client"

export async function deleteReview(id: string): Promise<void> {
  await apiClient.delete(`/admin/reviews/${id}`)
}
