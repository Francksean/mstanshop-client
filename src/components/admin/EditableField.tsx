"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Check, ChevronsUpDown, Loader2, Pencil } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { normalizeError } from "@/lib/api-error"
import { cn } from "@/lib/utils"

interface EditableFieldProps {
  label: string
  value: string
  /** Not called in read-only mode (`readOnlyHint` set) — optional so callers don't need a no-op. */
  onSave?: (newValue: string) => Promise<void>
  type?: "text" | "number" | "textarea"
  /** What to show in read mode — defaults to the raw `value` (e.g. pass a formatted price). */
  displayValue?: React.ReactNode
  /** When set, the field renders as plain read-only text (no pencil) with this note explaining why. */
  readOnlyHint?: string
  className?: string
  /** Extra classes applied to the `<Textarea>` element itself (type="textarea" only). */
  textareaClassName?: string
}

export function EditableField({
  label,
  value,
  onSave,
  type = "text",
  displayValue,
  readOnlyHint,
  className,
  textareaClassName,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [isSaving, setIsSaving] = useState(false)

  function startEdit() {
    setDraft(value)
    setIsEditing(true)
  }

  function cancel() {
    setDraft(value)
    setIsEditing(false)
  }

  async function commit() {
    if (draft === value) {
      setIsEditing(false)
      return
    }
    setIsSaving(true)
    try {
      await onSave?.(draft)
      setIsEditing(false)
    } catch (err) {
      toast.error(normalizeError(err).message)
      setDraft(value)
    } finally {
      setIsSaving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (e.key === "Escape") {
      e.preventDefault()
      cancel()
    } else if (e.key === "Enter" && type !== "textarea") {
      // Blur is the single source of truth for committing — this just triggers it,
      // avoiding a double-save if both Enter and the resulting blur fired commit().
      e.preventDefault()
      e.currentTarget.blur()
    }
  }

  if (readOnlyHint) {
    return (
      <div className={cn("flex flex-col gap-0.5", className)}>
        <span className="text-small text-ink/50">{label}</span>
        <span className="text-body text-ink">{displayValue ?? value}</span>
        <span className="text-small text-ink/40">{readOnlyHint}</span>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-small text-ink/50">{label}</span>
      {isEditing ? (
        <div className="flex items-center gap-1.5">
          {type === "textarea" ? (
            <Textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              className={cn("flex-1", textareaClassName)}
            />
          ) : (
            <Input
              autoFocus
              type={type}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              className="h-9 flex-1"
            />
          )}
          {isSaving && <Loader2 className="size-4 shrink-0 animate-spin text-ink/40" />}
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="text-body text-ink">{displayValue ?? value}</span>
          <button
            type="button"
            onClick={startEdit}
            aria-label={`Modifier ${label}`}
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sangria text-white transition-colors hover:bg-sangria/90"
          >
            <Pencil className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

interface EditableSelectFieldProps {
  label: string
  value: string
  displayValue: React.ReactNode
  options: { value: string; label: string }[]
  onSave: (newValue: string) => Promise<void>
  placeholder?: string
  className?: string
  /** Renders a searchable combobox instead of a plain dropdown — for longer option lists (categories, suppliers). */
  searchable?: boolean
  searchPlaceholder?: string
  emptyText?: string
}

/** Same pencil-toggle UX as `EditableField`, for a dropdown value (category, supplier) instead of free text. */
export function EditableSelectField({
  label,
  value,
  displayValue,
  options,
  onSave,
  placeholder,
  className,
  searchable,
  searchPlaceholder,
  emptyText,
}: EditableSelectFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  async function handleChange(newValue: string) {
    if (newValue === value) {
      setIsEditing(false)
      return
    }
    setIsSaving(true)
    try {
      await onSave(newValue)
      setIsEditing(false)
    } catch (err) {
      toast.error(normalizeError(err).message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-small text-ink/50">{label}</span>
      {isEditing ? (
        <div className="flex items-center gap-1.5">
          {searchable ? (
            <Popover open onOpenChange={(open) => !open && !isSaving && setIsEditing(false)}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="h-9 flex-1 justify-between font-normal">
                  <span className="truncate">{options.find((o) => o.value === value)?.label ?? placeholder}</span>
                  <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                <Command>
                  <CommandInput placeholder={searchPlaceholder ?? "Rechercher…"} />
                  <CommandList>
                    <CommandEmpty>{emptyText ?? "Aucun résultat."}</CommandEmpty>
                    <CommandGroup>
                      {options.map((o) => (
                        <CommandItem key={o.value} value={o.label} onSelect={() => handleChange(o.value)}>
                          <Check className={cn("size-4", o.value === value ? "opacity-100" : "opacity-0")} />
                          {o.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          ) : (
            <Select
              value={value}
              onValueChange={handleChange}
              defaultOpen
              onOpenChange={(open) => !open && !isSaving && setIsEditing(false)}
            >
              <SelectTrigger className="h-9 flex-1">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {isSaving && <Loader2 className="size-4 shrink-0 animate-spin text-ink/40" />}
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="text-body text-ink">{displayValue}</span>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label={`Modifier ${label}`}
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sangria text-white transition-colors hover:bg-sangria/90"
          >
            <Pencil className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
