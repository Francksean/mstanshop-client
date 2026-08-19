"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { getCategories } from "@/lib/services/categories.service"
import { getProducts } from "@/lib/services/products.service"
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
      const [categories, products] = await Promise.all([
        getCategories(),
        getProducts({ page: 1, limit: 1000 }),
      ])
      setItems(
        categories.map((category) => ({
          ...category,
          productCount: products.items.filter(
            (p) => p.category === category.slug || p.categoryId === category.id
          ).length,
        }))
      )
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
