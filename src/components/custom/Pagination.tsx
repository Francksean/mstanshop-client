"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"

interface PaginationProps {
  page: number
  total: number
  hasMore: boolean
  isLoading: boolean
  onPageChange: (page: number, mode: "replace" | "append") => void
}

export function Pagination({ page, total, hasMore, isLoading, onPageChange }: PaginationProps) {
  const t = useTranslations("products")
  const tCommon = useTranslations("common.actions")
  const pageCount = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE))

  if (pageCount <= 1 && !hasMore) return null

  return (
    <div className="flex justify-center pt-8">
      <div className="hidden items-center gap-2 md:flex">
        {Array.from({ length: pageCount }).map((_, i) => {
          const pageNumber = i + 1
          const isActive = pageNumber === page
          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber, "replace")}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md text-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sangria",
                isActive
                  ? "bg-sangria text-white"
                  : "text-ink/70 hover:bg-gold-light/40 hover:text-ink"
              )}
            >
              {pageNumber}
            </button>
          )
        })}
      </div>

      <div className="md:hidden">
        {hasMore && (
          <Button variant="outline" disabled={isLoading} onClick={() => onPageChange(page + 1, "append")}>
            {isLoading ? tCommon("loading") : t("loadMore")}
          </Button>
        )}
      </div>
    </div>
  )
}
