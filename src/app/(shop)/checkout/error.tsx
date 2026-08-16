"use client"

import { useTranslations } from "next-intl"
import { RetryFallback } from "@/components/custom/RetryFallback"

export default function CheckoutError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("errors")
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <RetryFallback title={t("checkoutTitle")} description={t("checkoutDescription")} onRetry={reset} />
    </div>
  )
}
