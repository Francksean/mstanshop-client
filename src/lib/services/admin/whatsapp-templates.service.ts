import { apiClient } from "@/lib/api-client"
import type { WhatsAppTemplate, WhatsAppTemplateRequest } from "@/types"

export async function listWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
  const { data } = await apiClient.get<WhatsAppTemplate[]>("/admin/whatsapp/templates")
  return data
}

export async function getWhatsAppTemplate(id: string): Promise<WhatsAppTemplate> {
  const { data } = await apiClient.get<WhatsAppTemplate>(`/admin/whatsapp/templates/${id}`)
  return data
}

export async function createWhatsAppTemplate(payload: WhatsAppTemplateRequest): Promise<WhatsAppTemplate> {
  const { data } = await apiClient.post<WhatsAppTemplate>("/admin/whatsapp/templates", payload)
  return data
}

export async function updateWhatsAppTemplate(
  id: string,
  payload: WhatsAppTemplateRequest
): Promise<WhatsAppTemplate> {
  const { data } = await apiClient.put<WhatsAppTemplate>(`/admin/whatsapp/templates/${id}`, payload)
  return data
}

export async function deleteWhatsAppTemplate(id: string): Promise<void> {
  await apiClient.delete(`/admin/whatsapp/templates/${id}`)
}
