"use client"

import { useTranslations } from "next-intl"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SORT_OPTIONS } from "@/lib/constants"
import type { SortOption } from "@/types"

interface SortDropdownProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const t = useTranslations("products")
  const tSort = useTranslations("products.sortOptions")

  return (
    <div className="flex items-center gap-2">
      <span className="text-small text-ink/60">{t("sortLabel")}</span>
      <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
        <SelectTrigger aria-label={t("sortAria")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {tSort(option.value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
