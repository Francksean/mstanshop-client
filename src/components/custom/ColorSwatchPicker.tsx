"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import type { ProductColor } from "@/types"

interface ColorSwatchPickerProps {
  colors: ProductColor[]
  value: string | null
  onChange: (colorHex: string) => void
  disabledHexes?: string[]
}

export function ColorSwatchPicker({ colors, value, onChange, disabledHexes }: ColorSwatchPickerProps) {
  const t = useTranslations("products")
  const selected = colors.find((c) => c.hex === value) ?? colors[0]

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-small font-medium tracking-wide text-ink/60 uppercase">
        {t("colorLabelWithName", { name: selected?.name ?? selected?.hex ?? "" })}
      </legend>
      <div role="radiogroup" className="flex flex-wrap gap-3">
        {colors.map((color) => {
          const isSelected = selected?.hex === color.hex
          const isDisabled = disabledHexes?.includes(color.hex) ?? false
          return (
            <button
              key={color.hex}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={color.name}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              onClick={() => onChange(color.hex)}
              className={cn(
                "relative h-8 w-8 rounded-full border transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sangria",
                isSelected ? "ring-2 ring-sangria ring-offset-2" : "border-black/10",
                isDisabled && "opacity-30 after:absolute after:inset-0 after:rounded-full after:bg-[linear-gradient(to_top_right,transparent_47%,var(--ink)_50%,transparent_53%)]"
              )}
              style={{ backgroundColor: color.hex }}
            />
          )
        })}
      </div>
    </fieldset>
  )
}
