import { apiClient } from "@/lib/api-client"
import type { AdminUserResponse, PagedResponse, Pageable, UserRole } from "@/types"

export interface AdminUsersPage {
  items: AdminUserResponse[]
  page: number
  totalPages: number
  totalElements: number
}

export interface AdminUsersQuery extends Pageable {
  search?: string
}

export async function getAllUsers(query: AdminUsersQuery = {}): Promise<AdminUsersPage> {
  const page = query.page ?? 0
  const size = query.size ?? 20

  const { data } = await apiClient.get<PagedResponse<AdminUserResponse>>("/admin/users", {
    params: { page, size, search: query.search || undefined },
  })
  return {
    items: data.content,
    page: data.page,
    totalPages: data.totalPages,
    totalElements: data.totalElements,
  }
}

export async function updateUserRole(id: string, role: UserRole): Promise<AdminUserResponse> {
  const { data } = await apiClient.patch<AdminUserResponse>(`/admin/users/${id}/role`, { role })
  return data
}
