"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { useAuthStore } from "@/stores/useAuthStore"
import type { LoginPayload, RegisterPayload } from "@/types"

export function useAuth() {
  const t = useTranslations("auth")
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const status = useAuthStore((s) => s.status)
  const error = useAuthStore((s) => s.error)
  const storeLogin = useAuthStore((s) => s.login)
  const storeRegister = useAuthStore((s) => s.register)
  const storeLogout = useAuthStore((s) => s.logout)

  async function login(payload: LoginPayload, redirectTo?: string) {
    await storeLogin(payload)
    const loggedInUser = useAuthStore.getState().user
    router.push(redirectTo || (loggedInUser?.role === "ROLE_ADMIN" ? "/admin/dashboard" : "/account/profile"))
  }

  async function register(payload: RegisterPayload, redirectTo?: string) {
    await storeRegister(payload)
    router.push(redirectTo || "/account/profile")
  }

  function logout() {
    storeLogout()
    toast.success(t("loggedOut"))
    router.push("/login")
  }

  return {
    user,
    status,
    error,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  }
}
