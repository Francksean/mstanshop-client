import { isAxiosError } from "axios"
import type { ApiError } from "@/types"

const KNOWN_CODES = [
  "invalid_credentials",
  "email_taken",
  "out_of_stock",
  "not_found",
  "network_error",
  "unauthorized",
  "unknown",
] as const

type KnownCode = (typeof KNOWN_CODES)[number]

function isKnownCode(code: string | undefined): code is KnownCode {
  return !!code && (KNOWN_CODES as readonly string[]).includes(code)
}

// Fallback used when a caller doesn't have a translation function in scope
// (e.g. the admin panel, which stays French-only and isn't wired to next-intl) —
// keeps those call sites compiling unchanged instead of requiring `t` everywhere.
const FRENCH_FALLBACK: Record<KnownCode, string> = {
  invalid_credentials: "Adresse e-mail ou mot de passe incorrect.",
  email_taken: "Un compte existe déjà avec cette adresse e-mail.",
  out_of_stock: "Ce produit n'est plus disponible dans la quantité demandée.",
  not_found: "Cet élément n'existe pas ou n'est plus disponible.",
  network_error: "Impossible de contacter le serveur. Vérifiez votre connexion.",
  unauthorized: "Votre session a expiré. Veuillez vous reconnecter.",
  unknown: "Une erreur est survenue. Veuillez réessayer.",
}

/** `t` is `useTranslations("apiErrors")` from the calling component/hook. Omit it only from
 *  non-i18n-aware call sites (the admin panel) — French fallbacks are used in that case. */
type Translate = (key: KnownCode) => string

function resolve(code: KnownCode, t?: Translate): string {
  return t ? t(code) : FRENCH_FALLBACK[code]
}

export function normalizeError(error: unknown, t?: Translate): ApiError {
  if (isAxiosError(error)) {
    if (!error.response) {
      return { message: resolve("network_error", t), raw: error }
    }

    const status = error.response.status
    const data = error.response.data as
      | {
          code?: string
          message?: string
          error?: string
          fieldErrors?: Record<string, string[]>
        }
      | undefined

    const code = data?.code
    const friendly = isKnownCode(code)
      ? resolve(code, t)
      : (data?.message ?? data?.error ?? resolve(status === 401 ? "unauthorized" : "unknown", t))

    return {
      message: friendly,
      status,
      fieldErrors: data?.fieldErrors,
      raw: error,
    }
  }

  if (error instanceof Error) {
    return { message: error.message || resolve("unknown", t), raw: error }
  }

  return { message: resolve("unknown", t), raw: error }
}

export function friendlyMessage(code: string, t?: Translate): string {
  return isKnownCode(code) ? resolve(code, t) : resolve("unknown", t)
}
