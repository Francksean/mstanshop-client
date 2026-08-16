"use client"

import { useCallback, useEffect, useState } from "react"
import { getAllOrders } from "@/lib/services/admin/orders.service"
import type { OrderStatus, OrderSummary } from "@/types"

const DEFAULT_PAGE_SIZE = 10

export function useAdminOrders() {
  const [items, setItems] = useState<OrderSummary[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined)

  const refetch = useCallback(
    async (targetPage = page, targetSearch = search, targetStatus = status, targetSize = pageSize) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getAllOrders({
          page: targetPage,
          size: targetSize,
          orderNumber: targetSearch,
          status: targetStatus,
        })
        setItems(result.items)
        setPage(result.page)
        setTotalPages(result.totalPages)
        setTotalElements(result.totalElements)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger les commandes.")
      } finally {
        setIsLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateSearch(value: string) {
    setSearch(value)
    refetch(0, value, status, pageSize)
  }

  function updateStatus(value: OrderStatus | undefined) {
    setStatus(value)
    refetch(0, search, value, pageSize)
  }

  function updatePageSize(size: number) {
    setPageSizeState(size)
    refetch(0, search, status, size)
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
    status,
    setSearch: updateSearch,
    setStatus: updateStatus,
    setPageSize: updatePageSize,
    setPage: (p: number) => refetch(p, search, status, pageSize),
    refetch: () => refetch(page, search, status, pageSize),
  }
}
