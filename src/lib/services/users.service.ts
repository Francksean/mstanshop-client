import { apiClient } from "@/lib/api-client"
import { getRoleFromToken } from "@/lib/jwt"
import { useAuthStore } from "@/stores/useAuthStore"
import type { UpdateProfilePayload, User, UserProfileResponse } from "@/types"

export async function updateProfile(userId: string, payload: UpdateProfilePayload): Promise<User> {
  void userId
  const { data } = await apiClient.put<UserProfileResponse>("/users/me", {
    firstName: payload.firstName,
    lastName: payload.lastName,
  })
  const token = useAuthStore.getState().token
  const role = (token ? getRoleFromToken(token) : null) ?? "ROLE_USER"
  return {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    role,
  }
}
