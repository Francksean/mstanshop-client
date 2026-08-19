"use client"

import { useState } from "react"
import { ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Category } from "@/types"

interface CategoryMultiSelectProps {
  categories: Category[]
  value: string[]
  onChange: (value: string[]) => void
}

export function CategoryMultiSelect({ categories, value, onChange }: CategoryMultiSelectProps) {
  const [open, setOpen] = useState(false)

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }

  const label =
    value.length === 0
      ? "Toutes les catégories"
      : value.length === 1
        ? (categories.find((c) => c.id === value[0])?.name ?? "1 catégorie")
        : `${value.length} catégories`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-56 justify-between font-normal">
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1" align="start">
        <div className="flex flex-col">
          {categories.map((c) => (
            <label
              key={c.id ?? c.slug}
              className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-body text-ink hover:bg-muted"
              style={c.parentId ? { paddingLeft: "1.5rem" } : undefined}
            >
              <Checkbox
                checked={c.id ? value.includes(c.id) : false}
                onCheckedChange={() => c.id && toggle(c.id)}
              />
              {c.name}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
