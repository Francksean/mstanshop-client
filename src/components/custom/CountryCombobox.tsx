"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
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
import { COUNTRIES } from "@/lib/countries"

interface CountryComboboxProps {
  id?: string
  value: string
  onChange: (code: string) => void
  invalid?: boolean
}

export function CountryCombobox({ id, value, onChange, invalid }: CountryComboboxProps) {
  const t = useTranslations("checkout.address")
  const [open, setOpen] = useState(false)
  const selected = COUNTRIES.find((c) => c.code === value)

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
          className="w-full justify-between font-normal"
        >
          {selected ? (
            <span className="flex items-center gap-2">
              <span aria-hidden>{selected.flag}</span>
              {selected.name}
            </span>
          ) : (
            t("chooseCountry")
          )}
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder={t("searchCountry")} />
          <CommandList>
            <CommandEmpty>{t("noCountryFound")}</CommandEmpty>
            <CommandGroup>
              {COUNTRIES.map((c) => (
                <CommandItem
                  key={c.code}
                  value={c.name}
                  onSelect={() => {
                    onChange(c.code)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("size-4", c.code === value ? "opacity-100" : "opacity-0")} />
                  <span aria-hidden>{c.flag}</span>
                  {c.name}
                  <span className="ml-auto text-small text-ink/50">{c.dialCode}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
