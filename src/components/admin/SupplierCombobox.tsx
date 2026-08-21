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
import type { Supplier } from "@/types"

interface SupplierComboboxProps {
  id?: string
  suppliers: Supplier[]
  value: string
  onChange: (value: string) => void
  /** Sentinel value representing "no supplier" — always offered as the first option. */
  noneValue?: string
  noneLabel?: string
  placeholder?: string
  className?: string
}

export function SupplierCombobox({
  id,
  suppliers,
  value,
  onChange,
  noneValue = "NONE",
  noneLabel = "Aucun fournisseur",
  placeholder = "Choisir un fournisseur",
  className,
}: SupplierComboboxProps) {
  const [open, setOpen] = useState(false)
  const selectedLabel =
    value === noneValue ? noneLabel : (suppliers.find((s) => s.id === value)?.name ?? placeholder)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("h-10 w-full justify-between font-normal", className)}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher un fournisseur…" />
          <CommandList>
            <CommandEmpty>Aucun fournisseur trouvé.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value={noneLabel}
                onSelect={() => {
                  onChange(noneValue)
                  setOpen(false)
                }}
              >
                <Check className={cn("size-4", value === noneValue ? "opacity-100" : "opacity-0")} />
                {noneLabel}
              </CommandItem>
              {suppliers.map((s) => (
                <CommandItem
                  key={s.id}
                  value={s.name}
                  onSelect={() => {
                    onChange(s.id)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("size-4", s.id === value ? "opacity-100" : "opacity-0")} />
                  {s.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
