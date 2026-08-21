"use client"

import { useState } from "react"
import { ChevronsUpDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Category } from "@/types"

interface CategoryMultiSelectProps {
  categories: Category[]
  value: string[]
  onChange: (value: string[]) => void
}

export function CategoryMultiSelect({ categories, value, onChange }: CategoryMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }

  const label =
    value.length === 0
      ? "Toutes les catégories"
      : value.length === 1
        ? (categories.find((c) => c.id === value[0])?.name ?? "1 catégorie")
        : `${value.length} catégories`

  const query = search.trim().toLowerCase()
  const filteredCategories = query
    ? categories.filter((c) => c.name.toLowerCase().includes(query))
    : categories

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSearch("")
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-56 justify-between font-normal">
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="size-4 shrink-0 opacity-50" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une catégorie…"
            className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex max-h-64 flex-col overflow-y-auto p-1">
          {filteredCategories.length === 0 ? (
            <p className="py-6 text-center text-small text-ink/50">Aucune catégorie trouvée.</p>
          ) : (
            filteredCategories.map((c) => (
              <label
                key={c.id ?? c.slug}
                className={cn(
                  "flex items-center gap-2 rounded-sm px-2 py-1.5 text-body text-ink hover:bg-muted",
                  c.parentId && "pl-6"
                )}
              >
                <Checkbox
                  checked={c.id ? value.includes(c.id) : false}
                  onCheckedChange={() => c.id && toggle(c.id)}
                />
                {c.name}
              </label>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
