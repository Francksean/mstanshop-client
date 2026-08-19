import type { Category, ProductColor, SortOption } from "@/types"

export const CATEGORIES: Category[] = [
  { slug: "vetements-afro", name: "Vêtements Afro" },
  { slug: "vetements-classiques", name: "Vêtements Classiques" },
  { slug: "bijoux", name: "Bijoux" },
  { slug: "tissus-pagne", name: "Tissus Pagne" },
  { slug: "sacs", name: "Sacs" },
]

export const FILTERABLE_COLORS: ProductColor[] = [
  { name: "Cream", hex: "#FBF8F4" },
  { name: "Ink", hex: "#2A211C" },
  { name: "Gold", hex: "#B8945A" },
  { name: "Sangria", hex: "#8B0000" },
]

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Nouveautés" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
]

export const DEFAULT_PAGE_SIZE = 8
export const MIN_PRICE = 0
export const MAX_PRICE = 100000

export const LOW_STOCK_THRESHOLD = 3
