"use client"

import { Search } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Category } from "@/types"

interface SearchBarCategoryProps {
  /** Omit to render a plain text-only search bar (no category select). */
  categories?: Category[]
  category?: string
  onCategoryChange?: (value: string) => void
  allCategoriesValue: string
  allCategoriesLabel: string
  categoryPlaceholder: string
  categoryAriaLabel: string
}

interface SearchBarProps extends Partial<SearchBarCategoryProps> {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  placeholder: string
  searchAriaLabel: string
  submitLabel: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder,
  searchAriaLabel,
  submitLabel,
  categories,
  category,
  onCategoryChange,
  allCategoriesValue,
  allCategoriesLabel,
  categoryPlaceholder,
  categoryAriaLabel,
  className,
}: SearchBarProps) {
  const withCategory = Boolean(categories && onCategoryChange && allCategoriesValue !== undefined)

  return (
    <form onSubmit={onSubmit} className={`flex min-w-0 flex-1 items-center gap-2 ${className ?? ""}`}>
      <div className="flex h-9 min-w-0 flex-1 items-center">
        {withCategory && (
          <Select value={category ?? allCategoriesValue!} onValueChange={onCategoryChange}>
            <SelectTrigger
              aria-label={categoryAriaLabel}
              className="hidden h-9 w-36 shrink-0 rounded-md rounded-r-none border border-black/10 bg-transparent shadow-none focus-visible:ring-2 focus-visible:ring-sangria sm:flex md:w-44"
            >
              <SelectValue placeholder={categoryPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={allCategoriesValue!}>{allCategoriesLabel}</SelectItem>
              {categories!.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={searchAriaLabel}
          className={`h-9 min-w-0 flex-1 rounded-md border border-black/10 bg-transparent px-3 text-body text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-sangria ${
            withCategory ? "sm:rounded-l-none" : ""
          }`}
        />
      </div>

      <button
        type="submit"
        aria-label={submitLabel}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sangria text-white transition-colors hover:bg-sangria-dark"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  )
}
