"use client"

import { useTranslations } from "next-intl"

interface QuantityStepperProps {
  value: number
  min?: number
  max: number
  onChange: (value: number) => void
}

export function QuantityStepper({ value, min = 1, max, onChange }: QuantityStepperProps) {
  const t = useTranslations("products")

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label={t("decreaseQuantity")}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-black/10 text-ink transition-colors hover:bg-gold-light/40 disabled:opacity-40"
      >
        −
      </button>
      <span className="w-8 text-center text-body" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label={t("increaseQuantity")}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-black/10 text-ink transition-colors hover:bg-gold-light/40 disabled:opacity-40"
      >
        +
      </button>
    </div>
  )
}
