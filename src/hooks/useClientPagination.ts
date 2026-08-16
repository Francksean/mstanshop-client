"use client"

import { useEffect, useMemo, useState } from "react"

const DEFAULT_PAGE_SIZE = 10

export function useClientPagination<T>(items: T[], initialPageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (page > totalPages) setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, pageSize])

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  function changePageSize(size: number) {
    setPageSize(size)
    setPage(1)
  }

  return {
    pageItems,
    page,
    totalPages,
    pageSize,
    totalElements: items.length,
    setPage,
    setPageSize: changePageSize,
  }
}
