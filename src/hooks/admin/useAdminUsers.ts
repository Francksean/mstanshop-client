"use client"

import { useCallback, useEffect, useState } from "react"
import { getAllUsers } from "@/lib/services/admin/users.service"
import type { AdminUserResponse } from "@/types"

const DEFAULT_PAGE_SIZE = 10

export function useAdminUsers() {
  const [items, setItems] = useState<AdminUserResponse[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const refetch = useCallback(
    async (targetPage = page, targetSearch = search, targetSize = pageSize) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getAllUsers({ page: targetPage, size: targetSize, search: targetSearch })
        setItems(result.items)
        setPage(result.page)
        setTotalPages(result.totalPages)
        setTotalElements(result.totalElements)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger les utilisateurs.")
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
    refetch(0, value, pageSize)
  }

  function updatePageSize(size: number) {
    setPageSizeState(size)
    refetch(0, search, size)
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
    setSearch: updateSearch,
    setPageSize: updatePageSize,
    setPage: (p: number) => refetch(p, search, pageSize),
    refetch: () => refetch(page, search, pageSize),
  }
}
