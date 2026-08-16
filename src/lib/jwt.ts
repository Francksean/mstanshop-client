import type { UserRole } from "@/types"

/** Decodes a JWT payload without verifying the signature — safe for client-side role/claim reads only. */
export function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const json = decodeURIComponent(
      atob(normalized)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

const KNOWN_ROLES: UserRole[] = ["ROLE_ADMIN", "ROLE_USER"]

export function getRoleFromToken(token: string): UserRole | null {
  const claims = decodeJwt(token)
  if (!claims) return null

  const raw = claims.role ?? claims.roles ?? claims.authorities ?? claims.scope
  const candidates = Array.isArray(raw) ? raw : [raw]

  for (const candidate of candidates) {
    if (typeof candidate === "string" && KNOWN_ROLES.includes(candidate as UserRole)) {
      return candidate as UserRole
    }
  }
  return null
}
