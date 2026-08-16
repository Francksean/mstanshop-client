"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

interface RetryFallbackProps {
  title?: string
  description?: string
  onRetry: () => void
}

export function RetryFallback({ title, description, onRetry }: RetryFallbackProps) {
  const t = useTranslations("errors")

  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h2 className="text-h2 text-ink">{title ?? t("genericTitle")}</h2>
      <p className="max-w-md text-body text-ink/60">{description ?? t("genericDescription")}</p>
      <Button onClick={onRetry} className="mt-2">
        {t("retry")}
      </Button>
    </div>
  )
}
