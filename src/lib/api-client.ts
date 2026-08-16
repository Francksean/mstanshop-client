import axios from "axios"
import { useAuthStore } from "@/stores/useAuthStore"

export const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api`,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`)
  }

  if (process.env.NODE_ENV === "development") {
    console.group(`%c→ ${config.method?.toUpperCase()} ${config.url}`, "color:#8B0000;font-weight:bold")
    console.table({ params: config.params, data: config.data })
    console.groupEnd()
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.group(`%c← ${response.status} ${response.config.url}`, "color:#B8945A;font-weight:bold")
      console.table(Array.isArray(response.data) ? response.data : [response.data])
      console.groupEnd()
    }
    return response
  },
  (error) => {
    if (process.env.NODE_ENV === "development") {
      console.group(
        `%c✕ ${error.response?.status ?? "ERR"} ${error.config?.url}`,
        "color:#8B0000;font-weight:bold"
      )
      console.table(error.response?.data ?? { message: error.message })
      console.groupEnd()
    }

    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }

    // Left as the raw axios error — normalizeError() is called (with a translation
    // function) at each catch site instead, since this interceptor has no locale context.
    return Promise.reject(error)
  }
)
