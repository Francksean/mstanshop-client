import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { LoginPayload, RegisterPayload, User } from "@/types"
import * as authService from "@/lib/services/auth.service"
import { useGuestCartStore } from "@/stores/useGuestCartStore"
import { useCartStore } from "@/stores/useCartStore"

function takeGuestCartItems() {
  const items = useGuestCartStore.getState().items
  return items.length > 0
    ? items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity }))
    : undefined
}

type AuthStatus = "idle" | "loading" | "authenticated" | "error"

const ROLE_COOKIE = "mstan_role"

function setRoleCookie(role: string | null) {
  if (typeof document === "undefined") return
  if (role) {
    document.cookie = `${ROLE_COOKIE}=${role}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`
  } else {
    document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0`
  }
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  status: AuthStatus
  error: string | null
  isAdmin: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  setError: (message: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      status: "idle",
      error: null,
      isAdmin: false,

      login: async (payload) => {
        set({ status: "loading", error: null })
        try {
          const cartItems = takeGuestCartItems()
          const { user, token, refreshToken } = await authService.login({ ...payload, cartItems })
          setRoleCookie(user.role)
          set({
            user,
            token,
            refreshToken,
            status: "authenticated",
            error: null,
            isAdmin: user.role === "ROLE_ADMIN",
          })
          if (cartItems) useGuestCartStore.getState().clearCart()
          useCartStore.getState().reset()
        } catch (error) {
          const message = error instanceof Error ? error.message : "Connexion impossible."
          set({ status: "error", error: message })
          throw error
        }
      },

      register: async (payload) => {
        set({ status: "loading", error: null })
        try {
          const cartItems = takeGuestCartItems()
          const { user, token, refreshToken } = await authService.register({ ...payload, cartItems })
          setRoleCookie(user.role)
          set({
            user,
            token,
            refreshToken,
            status: "authenticated",
            error: null,
            isAdmin: user.role === "ROLE_ADMIN",
          })
          if (cartItems) useGuestCartStore.getState().clearCart()
          useCartStore.getState().reset()
        } catch (error) {
          const message = error instanceof Error ? error.message : "Inscription impossible."
          set({ status: "error", error: message })
          throw error
        }
      },

      logout: () => {
        setRoleCookie(null)
        set({
          user: null,
          token: null,
          refreshToken: null,
          status: "idle",
          error: null,
          isAdmin: false,
        })
        useCartStore.getState().reset()
      },

      setError: (message) => set({ error: message }),
    }),
    {
      name: "mstanshop-auth",
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAdmin: state.isAdmin,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          setRoleCookie(state.user.role)
        }
      },
    }
  )
)
