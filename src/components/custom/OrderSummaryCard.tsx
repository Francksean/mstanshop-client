"use client"

import { Info } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatPrice } from "@/lib/utils"

interface OrderSummaryCardProps {
  subtotal: number
  shipping?: number
  /** True while the shipping method hasn't been chosen yet — shows an info icon instead of a final amount. */
  shippingPending?: boolean
  discount?: number | null
  promoCode?: string | null
  promoCodeSlot?: React.ReactNode
  action?: React.ReactNode
}

export function OrderSummaryCard({
  subtotal,
  shipping = 0,
  shippingPending = false,
  discount,
  promoCode,
  promoCodeSlot,
  action,
}: OrderSummaryCardProps) {
  const t = useTranslations("checkout.summary")
  const locale = useLocale()
  const total = subtotal - (discount ?? 0) + shipping

  return (
    <div className="flex flex-col gap-4 rounded-md border border-black/10 bg-card p-8 shadow-sm">
      <h2 className="text-h2 text-ink">{t("title")}</h2>
      <div className="flex flex-col gap-2 text-body">
        <div className="flex justify-between text-ink/70">
          <span>{t("subtotal")}</span>
          <span>{formatPrice(subtotal, locale)}</span>
        </div>
        {Boolean(discount) && (
          <div className="flex justify-between text-sangria">
            <span>
              {t("discount")}
              {promoCode ? ` (${promoCode})` : ""}
            </span>
            <span>-{formatPrice(discount ?? 0, locale)}</span>
          </div>
        )}
        <div className="flex justify-between text-ink/70">
          <span className="inline-flex items-center gap-1.5">
            {t("shipping")}
            {shippingPending && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" aria-label={t("shippingInfoAria")} className="text-ink/40 hover:text-ink/70">
                    <Info className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{t("shippingInfoTooltip")}</TooltipContent>
              </Tooltip>
            )}
          </span>
          <span>
            {shippingPending ? t("notYetCalculated") : shipping === 0 ? t("offered") : formatPrice(shipping, locale)}
          </span>
        </div>
      </div>
      {promoCodeSlot}
      <div className="flex justify-between border-t border-black/10 pt-4 text-h2 font-semibold text-ink">
        <span>{t("total")}</span>
        <span>{formatPrice(total, locale)}</span>
      </div>
      {action}
    </div>
  )
}
