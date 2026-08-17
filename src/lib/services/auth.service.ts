import { apiClient } from "@/lib/api-client"
import { getRoleFromToken } from "@/lib/jwt"
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
  UserProfileResponse,
} from "@/types"

interface AuthResult {
  user: User
  token: string
  refreshToken: string
}

async function fetchProfileAsUser(accessToken: string): Promise<User> {
  const { data } = await apiClient.get<UserProfileResponse>("/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const role = getRoleFromToken(accessToken) ?? "ROLE_USER"
  return {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    role,
  }
}

export async function login(payload: LoginPayload): Promise<AuthResult> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", payload)
  const user = await fetchProfileAsUser(data.accessToken)
  return { user, token: data.accessToken, refreshToken: data.refreshToken }
}

export async function register(payload: RegisterPayload): Promise<AuthResult> {
  const { data } = await apiClient.post<AuthResponse>("/auth/register", payload)
  const user = await fetchProfileAsUser(data.accessToken)
  return { user, token: data.accessToken, refreshToken: data.refreshToken }
}

/**
 * Completes an OAuth2 login (e.g. Google) after the backend's redirect flow hands the
 * tokens back to the frontend as URL query params — there's no login/register request
 * body here, just tokens to resolve into a profile the same way password auth does.
 */
export async function completeOAuthLogin(accessToken: string, refreshToken: string): Promise<AuthResult> {
  const user = await fetchProfileAsUser(accessToken)
  return { user, token: accessToken, refreshToken }
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout")
}
