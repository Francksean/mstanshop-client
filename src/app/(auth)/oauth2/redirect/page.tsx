"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Loader2, TriangleAlert } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { OAUTH_REDIRECT_STORAGE_KEY } from "@/lib/oauth"

function OAuthCallbackContent() {
  const t = useTranslations("auth.oauthCallback")
  const searchParams = useSearchParams()
  const { loginWithOAuth } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    const token = searchParams.get("token")
    const refresh = searchParams.get("refresh")
    if (!token || !refresh) {
      setError(t("missingTokens"))
      return
    }

    const redirect = sessionStorage.getItem(OAUTH_REDIRECT_STORAGE_KEY)
    sessionStorage.removeItem(OAUTH_REDIRECT_STORAGE_KEY)

    loginWithOAuth(token, refresh, redirect || undefined).catch(() => setError(t("failed")))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-md bg-card p-8 text-center">
        <TriangleAlert className="size-8 text-sangria" />
        <p className="text-body text-ink/70">{error}</p>
        <Link href="/login" className="text-small text-sangria underline-offset-4 hover:underline">
          {t("backToLogin")}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-md bg-card p-8 text-center">
      <Loader2 className="size-8 animate-spin text-sangria" />
      <p className="text-body text-ink/70">{t("connecting")}</p>
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <OAuthCallbackContent />
    </Suspense>
  )
}
