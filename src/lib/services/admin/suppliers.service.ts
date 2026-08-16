import { apiClient } from "@/lib/api-client"
import type { Supplier, SupplierRequest } from "@/types"

export async function listSuppliers(): Promise<Supplier[]> {
  const { data } = await apiClient.get<Supplier[]>("/admin/suppliers")
  return data
}

export async function getSupplier(id: string): Promise<Supplier> {
  const { data } = await apiClient.get<Supplier>(`/admin/suppliers/${id}`)
  return data
}

export async function createSupplier(payload: SupplierRequest): Promise<Supplier> {
  const { data } = await apiClient.post<Supplier>("/admin/suppliers", payload)
  return data
}

export async function updateSupplier(id: string, payload: SupplierRequest): Promise<Supplier> {
  const { data } = await apiClient.put<Supplier>(`/admin/suppliers/${id}`, payload)
  return data
}

export async function deleteSupplier(id: string): Promise<void> {
  await apiClient.delete(`/admin/suppliers/${id}`)
}
