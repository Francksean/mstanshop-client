"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { LOW_STOCK_THRESHOLD } from "@/lib/constants"

interface StockBadgeProps {
  stock: number
  className?: string
}

export function StockBadge({ stock, className }: StockBadgeProps) {
  const t = useTranslations("products.stock")

  if (stock <= 0) {
    return <span className={cn("text-small text-ink/50", className)}>{t("outOfStock")}</span>
  }

  if (stock === 1) {
    return (
      <span className={cn("text-small font-medium text-sangria", className)}>
        {t("lastOne")}
      </span>
    )
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return (
      <span className={cn("text-small font-medium text-sangria", className)}>
        {t("low", { count: stock })}
      </span>
    )
  }

  return <span className={cn("text-small text-ink/60", className)}>{t("inStock")}</span>
}
