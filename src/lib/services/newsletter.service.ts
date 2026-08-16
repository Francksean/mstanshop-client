import { apiClient } from "@/lib/api-client"

export interface NewsletterSubscribePayload {
  email?: string
  phoneNumber?: string
}

export async function subscribeToNewsletter(payload: NewsletterSubscribePayload): Promise<void> {
  await apiClient.post("/newsletter", payload)
}
