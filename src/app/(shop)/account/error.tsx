"use client"

import { useTranslations } from "next-intl"
import { RetryFallback } from "@/components/custom/RetryFallback"

export default function AccountError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("account")
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <RetryFallback title={t("errorTitle")} description={t("errorDescription")} onRetry={reset} />
    </div>
  )
}
