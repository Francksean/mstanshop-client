"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { getProducts } from "@/lib/services/products.service"
import { normalizeError } from "@/lib/api-error"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import type { Product, ProductQueryParams } from "@/types"

type FetchMode = "replace" | "append"

interface UseProductsResult {
  items: Product[]
  page: number
  total: number
  hasMore: boolean
  isLoading: boolean
  error: string | null
  fetchPage: (page: number, mode: FetchMode) => void
}

export function useProducts(
  filters: Omit<ProductQueryParams, "page" | "limit">
): UseProductsResult {
  const t = useTranslations("apiErrors")
  const [items, setItems] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [settledKey, setSettledKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const requestId = useRef(0)

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        categoryIds: filters.categoryIds,
        search: filters.search,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sort: filters.sort,
        featured: filters.featured,
        colors: filters.colors,
      }),
    [filters.categoryIds, filters.search, filters.minPrice, filters.maxPrice, filters.sort, filters.featured, filters.colors]
  )

  const runFetch = useCallback(
    (targetPage: number, mode: FetchMode) => {
      const currentRequest = ++requestId.current
      const requestKey = `${filterKey}:${targetPage}:${mode}`
      setPendingKey(requestKey)

      getProducts({ ...filters, page: targetPage, limit: DEFAULT_PAGE_SIZE })
        .then((result) => {
          if (currentRequest !== requestId.current) return
          setItems((prev) => (mode === "append" ? [...prev, ...result.items] : result.items))
          setPage(result.page)
          setTotal(result.total)
          setHasMore(result.hasMore)
          setError(null)
        })
        .catch((err) => {
          if (currentRequest !== requestId.current) return
          setError(normalizeError(err, t).message)
        })
        .finally(() => {
          if (currentRequest !== requestId.current) return
          setSettledKey(requestKey)
        })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterKey, filters.categoryIds, filters.search, filters.minPrice, filters.maxPrice, filters.sort, filters.featured, filters.colors, t]
  )

  useEffect(() => {
    // runFetch's first synchronous statement is setPendingKey — this is the
    // documented fetch-on-mount/fetch-on-dependency-change effect pattern
    // (https://react.dev/learn/you-might-not-need-an-effect#fetching-data),
    // not a state-sync loop, so the compiler's heuristic is suppressed here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runFetch(1, "replace")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey])

  return {
    items,
    page,
    total,
    hasMore,
    isLoading: pendingKey !== settledKey,
    error,
    fetchPage: runFetch,
  }
}
