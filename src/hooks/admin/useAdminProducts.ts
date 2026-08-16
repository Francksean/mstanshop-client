"use client"

import { useCallback, useEffect, useState } from "react"
import { getProducts } from "@/lib/services/products.service"
import type { Product } from "@/types"

const DEFAULT_PAGE_SIZE = 10

export function useAdminProducts() {
  const [items, setItems] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [categoryIds, setCategoryIdsState] = useState<string[]>([])

  const refetch = useCallback(
    async (
      targetPage = page,
      targetSearch = search,
      targetSize = pageSize,
      targetCategoryIds = categoryIds
    ) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getProducts({
          page: targetPage,
          limit: targetSize,
          search: targetSearch || undefined,
          categoryIds: targetCategoryIds.length ? targetCategoryIds : undefined,
        })
        setItems(result.items)
        setPage(result.page)
        setTotalElements(result.total)
        setTotalPages(Math.max(1, Math.ceil(result.total / targetSize)))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger les produits.")
      } finally {
        setIsLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateSearch(value: string) {
    setSearch(value)
    refetch(1, value, pageSize, categoryIds)
  }

  function updatePageSize(size: number) {
    setPageSizeState(size)
    refetch(1, search, size, categoryIds)
  }

  function updateCategoryIds(value: string[]) {
    setCategoryIdsState(value)
    refetch(1, search, pageSize, value)
  }

  return {
    items,
    page,
    totalPages,
    totalElements,
    pageSize,
    isLoading,
    error,
    search,
    categoryIds,
    setSearch: updateSearch,
    setPageSize: updatePageSize,
    setCategoryIds: updateCategoryIds,
    setPage: (p: number) => refetch(p, search, pageSize, categoryIds),
    refetch: () => refetch(page, search, pageSize, categoryIds),
  }
}
