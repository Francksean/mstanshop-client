"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { getCategories } from "@/lib/services/categories.service"
import type { Category } from "@/types"

export interface CategoryWithCount extends Category {
  productCount: number
}

export interface CategoryTreeGroup {
  root: CategoryWithCount
  children: CategoryWithCount[]
}

export function useAdminCategories() {
  const [items, setItems] = useState<CategoryWithCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // productCount now comes straight from the API (parent = sum of its
      // subcategories' counts + its own direct products) — no more client-side
      // approximation from a capped product fetch.
      const categories = await getCategories()
      setItems(categories.map((category) => ({ ...category, productCount: category.productCount ?? 0 })))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les catégories.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch()
  }, [refetch])

  const tree = useMemo<CategoryTreeGroup[]>(() => {
    const roots = items.filter((c) => !c.parentId)
    return roots.map((root) => ({
      root,
      children: items.filter((c) => c.parentId === root.id),
    }))
  }, [items])

  return { items, tree, isLoading, error, refetch }
}
