import { apiClient } from "@/lib/api-client"
import type { PromoCode, PromoCodeRequest } from "@/types"

export async function listPromoCodes(): Promise<PromoCode[]> {
  const { data } = await apiClient.get<PromoCode[]>("/admin/promo-codes")
  return data
}

export async function getPromoCode(id: string): Promise<PromoCode> {
  const { data } = await apiClient.get<PromoCode>(`/admin/promo-codes/${id}`)
  return data
}

export async function createPromoCode(payload: PromoCodeRequest): Promise<PromoCode> {
  const { data } = await apiClient.post<PromoCode>("/admin/promo-codes", payload)
  return data
}

export async function updatePromoCode(id: string, payload: PromoCodeRequest): Promise<PromoCode> {
  const { data } = await apiClient.put<PromoCode>(`/admin/promo-codes/${id}`, payload)
  return data
}

export async function deletePromoCode(id: string): Promise<void> {
  await apiClient.delete(`/admin/promo-codes/${id}`)
}
