"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Category } from "@/types"

interface CategoryComboboxProps {
  id?: string
  categories: Category[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
  invalid?: boolean
  className?: string
}

export function CategoryCombobox({
  id,
  categories,
  value,
  onChange,
  placeholder = "Choisir une catégorie",
  invalid,
  className,
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false)
  const selected = categories.find((c) => (c.id ?? c.slug) === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          className={cn("h-10 w-full justify-between font-normal", className)}
        >
          <span className="truncate">{selected ? selected.name : placeholder}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher une catégorie…" />
          <CommandList>
            <CommandEmpty>Aucune catégorie trouvée.</CommandEmpty>
            <CommandGroup>
              {categories.map((c) => {
                const optionValue = c.id ?? c.slug
                return (
                  <CommandItem
                    key={optionValue}
                    value={c.name}
                    onSelect={() => {
                      onChange(optionValue)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn("size-4", optionValue === value ? "opacity-100" : "opacity-0")} />
                    <span className={cn(c.parentId && "pl-3 text-ink/70")}>{c.name}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
