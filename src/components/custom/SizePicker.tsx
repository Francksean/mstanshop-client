"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface SizePickerProps {
  sizes: string[]
  value: string | null
  onChange: (size: string) => void
  disabledSizes?: string[]
}

export function SizePicker({ sizes, value, onChange, disabledSizes }: SizePickerProps) {
  const t = useTranslations("products")

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-small font-medium tracking-wide text-ink/60 uppercase">
        {t("sizeLabel")}
      </legend>
      <div role="radiogroup" className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isSelected = value === size
          const isDisabled = disabledSizes?.includes(size) ?? false
          return (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              onClick={() => onChange(size)}
              className={cn(
                "flex h-10 min-w-14 items-center justify-center rounded-full border px-4 text-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sangria",
                isSelected
                  ? "border-sangria bg-sangria/5 text-sangria font-medium"
                  : "border-black/10 text-ink hover:bg-gold-light/40",
                isDisabled && "cursor-not-allowed opacity-30 line-through"
              )}
            >
              {size}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
