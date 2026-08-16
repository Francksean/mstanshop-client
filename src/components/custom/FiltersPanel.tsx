"use client"

import { useLocale, useTranslations } from "next-intl"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { FILTERABLE_COLORS, MAX_PRICE, MIN_PRICE } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/utils"
import type { Category } from "@/types"

export interface FiltersState {
  categoryIds: string[]
  minPrice: number
  maxPrice: number
  colors: string[]
}

interface FiltersPanelProps {
  filters: FiltersState
  onChange: (filters: FiltersState) => void
  categories: Category[]
  className?: string
}

export function FiltersPanel({ filters, onChange, categories, className }: FiltersPanelProps) {
  const t = useTranslations("products")
  const locale = useLocale()

  function toggleCategory(id: string) {
    const isSelected = filters.categoryIds.includes(id)
    onChange({
      ...filters,
      categoryIds: isSelected
        ? filters.categoryIds.filter((c) => c !== id)
        : [...filters.categoryIds, id],
    })
  }

  function toggleColor(name: string) {
    const isSelected = filters.colors.includes(name)
    onChange({
      ...filters,
      colors: isSelected ? filters.colors.filter((c) => c !== name) : [...filters.colors, name],
    })
  }

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <div>
        <h3 className="mb-4 text-small font-medium tracking-wide text-ink/60 uppercase">
          {t("categoryLabel")}
        </h3>
        <div className="flex flex-col gap-3">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2 text-body text-ink">
              <Checkbox
                checked={category.id ? filters.categoryIds.includes(category.id) : false}
                onCheckedChange={() => category.id && toggleCategory(category.id)}
              />
              {category.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-small font-medium tracking-wide text-ink/60 uppercase">{t("priceLabel")}</h3>
        <Slider
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={5}
          value={[filters.minPrice, filters.maxPrice]}
          onValueChange={([min, max]) => onChange({ ...filters, minPrice: min, maxPrice: max })}
          aria-label={t("priceRangeAria")}
        />
        <div className="mt-2 flex justify-between text-small text-ink/60">
          <span>{formatPrice(filters.minPrice, locale)}</span>
          <span>{formatPrice(filters.maxPrice, locale)}</span>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-small font-medium tracking-wide text-ink/60 uppercase">
          {t("colorLabel")}
        </h3>
        <div className="flex gap-3">
          {FILTERABLE_COLORS.map((color) => (
            <button
              key={color.name}
              type="button"
              aria-label={color.name}
              aria-pressed={filters.colors.includes(color.name)}
              onClick={() => toggleColor(color.name)}
              className={cn(
                "h-7 w-7 rounded-full border transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sangria",
                filters.colors.includes(color.name)
                  ? "ring-2 ring-sangria ring-offset-2"
                  : "border-black/10"
              )}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
