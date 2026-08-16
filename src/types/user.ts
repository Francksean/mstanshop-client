export type UserRole = "ROLE_USER" | "ROLE_ADMIN"

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: UserRole
}

/** A locally-held guest cart line, sent to login/register for best-effort server-side merge. */
export interface CartItemPayload {
  productId: string
  variantId?: string
  quantity: number
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  cartItems?: CartItemPayload[]
}

export interface LoginPayload {
  email: string
  password: string
  cartItems?: CartItemPayload[]
}

export interface UpdateProfilePayload {
  firstName: string
  lastName: string
  email: string
  phone?: string
}

/** Backend `AuthResponse` — returned by /auth/login, /auth/register, /auth/refresh. */
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
}

/** Backend `UserProfileResponse` — returned by GET /users/me. Carries no role; role is read from the JWT. */
export interface UserProfileResponse {
  id: string
  email: string
  firstName: string
  lastName: string
  authProvider?: string
  createdAt?: string
}
