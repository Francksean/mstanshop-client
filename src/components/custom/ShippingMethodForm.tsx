"use client"

import { useLocale, useTranslations } from "next-intl"
import { Store, Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/utils"

export type ShippingMethod = "PICKUP" | "HOME_DELIVERY"

export const SHIPPING_COSTS: Record<ShippingMethod, number> = {
  PICKUP: 0,
  HOME_DELIVERY: 1500,
}

interface ShippingMethodFormProps {
  value: ShippingMethod
  onChange: (value: ShippingMethod) => void
}

export function ShippingMethodForm({ value, onChange }: ShippingMethodFormProps) {
  const t = useTranslations("checkout.shipping")
  const locale = useLocale()

  const options: { value: ShippingMethod; label: string; description: string; icon: typeof Store }[] = [
    { value: "PICKUP", label: t("pickup.label"), description: t("pickup.description"), icon: Store },
    { value: "HOME_DELIVERY", label: t("delivery.label"), description: t("delivery.description"), icon: Truck },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-h2 text-ink">{t("title")}</h2>

      <div role="radiogroup" aria-label={t("ariaLabel")} className="flex flex-col gap-3">
        {options.map((option) => {
          const isSelected = value === option.value
          const cost = SHIPPING_COSTS[option.value]
          const Icon = option.icon

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex items-start gap-3 rounded-md border px-4 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sangria",
                isSelected
                  ? "border-sangria bg-sangria/5"
                  : "border-black/10 hover:bg-gold-light/40"
              )}
            >
              <Icon className={cn("mt-0.5 size-5 shrink-0", isSelected ? "text-sangria" : "text-ink/60")} />
              <div className="flex flex-1 flex-col gap-1">
                <span className={cn("text-body font-medium", isSelected ? "text-sangria" : "text-ink")}>
                  {option.label}
                </span>
                <span className="text-small text-ink/60">{option.description}</span>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1 text-small font-semibold",
                  cost === 0
                    ? "border border-black/10 bg-cream text-ink/70"
                    : "bg-sangria text-white"
                )}
              >
                {cost === 0 ? t("free") : `+${formatPrice(cost, locale)}`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
