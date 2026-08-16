"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/custom/EmptyState"
import { cn } from "@/lib/utils"

export interface DataTableColumn<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  className?: string
  /** When set, the column header becomes clickable and rows are sorted client-side by this accessor. */
  sortAccessor?: (row: T) => string | number
}

interface DataTablePagination {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  /** Whether `page` is 0-indexed (admin/orders/users) or 1-indexed (products catalog). */
  zeroIndexed?: boolean
  totalElements?: number
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
}

interface DataTableSearch {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  pagination?: DataTablePagination
  onRowClick?: (row: T) => void
  /** Controlled search box rendered above the table; debounced internally before calling `onChange`. */
  search?: DataTableSearch
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  emptyTitle = "Aucun résultat",
  emptyDescription = "Rien à afficher pour le moment.",
  pagination,
  onRowClick,
  search,
}: DataTableProps<T>) {
  const showEmpty = !isLoading && rows.length === 0
  const [localSearch, setLocalSearch] = useState(search?.value ?? "")
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalSearch(search?.value ?? "")
  }, [search?.value])

  useEffect(() => {
    if (!search) return
    const handle = setTimeout(() => {
      if (localSearch !== search.value) search.onChange(localSearch)
    }, 300)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch])

  const sortedRows = useMemo(() => {
    if (!sort) return rows
    const column = columns.find((c) => c.key === sort.key)
    if (!column?.sortAccessor) return rows
    const factor = sort.direction === "asc" ? 1 : -1
    return [...rows].sort((a, b) => {
      const av = column.sortAccessor!(a)
      const bv = column.sortAccessor!(b)
      if (av < bv) return -1 * factor
      if (av > bv) return 1 * factor
      return 0
    })
  }, [rows, sort, columns])

  function toggleSort(key: string) {
    setSort((prev) => {
      if (prev?.key !== key) return { key, direction: "asc" }
      if (prev.direction === "asc") return { key, direction: "desc" }
      return null
    })
  }

  return (
    <div className="flex flex-col gap-2">
      {search && (
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink/40" />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={search.placeholder ?? "Rechercher…"}
            className="h-8 pl-8"
          />
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-md border border-black/10">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => {
                const isSortable = Boolean(col.sortAccessor)
                const isActive = sort?.key === col.key
                return (
                  <TableHead key={col.key} className={col.className}>
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className="inline-flex items-center gap-1 hover:text-ink"
                      >
                        {col.header}
                        {isActive ? (
                          sort?.direction === "asc" ? (
                            <ChevronUp className="size-3.5" />
                          ) : (
                            <ChevronDown className="size-3.5" />
                          )
                        ) : (
                          <ChevronsUpDown className="size-3.5 opacity-40" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`shimmer-${i}`}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton className="h-5 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading &&
              sortedRows.map((row) => (
                <TableRow
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {showEmpty && (
          <div className="py-6">
            <EmptyState title={emptyTitle} description={emptyDescription} />
          </div>
        )}

        {pagination && (pagination.totalPages > 1 || pagination.onPageSizeChange) && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 px-3 py-2">
            <div className="flex items-center gap-3">
              <span className="text-small text-ink/60">
                Page {pagination.zeroIndexed ? pagination.page + 1 : pagination.page} / {pagination.totalPages}
                {pagination.totalElements !== undefined && ` · ${pagination.totalElements} au total`}
              </span>
              {pagination.onPageSizeChange && (
                <div className="flex items-center gap-2">
                  <span className="text-small text-ink/60">Par page</span>
                  <Select
                    value={String(pagination.pageSize ?? 10)}
                    onValueChange={(v) => pagination.onPageSizeChange?.(Number(v))}
                  >
                    <SelectTrigger size="sm" aria-label="Éléments par page" className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(pagination.pageSizeOptions ?? [10, 20, 50, 100]).map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon-xs"
                disabled={pagination.zeroIndexed ? pagination.page <= 0 : pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                aria-label="Page précédente"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                disabled={
                  pagination.zeroIndexed
                    ? pagination.page >= pagination.totalPages - 1
                    : pagination.page >= pagination.totalPages
                }
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                aria-label="Page suivante"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
