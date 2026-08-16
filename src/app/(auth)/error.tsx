"use client"

import { useTranslations } from "next-intl"
import { RetryFallback } from "@/components/custom/RetryFallback"

export default function AuthError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("errors")
  return <RetryFallback title={t("authTitle")} description={t("authDescription")} onRetry={reset} />
}
