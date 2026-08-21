"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface RefreshButtonProps {
  onRefresh: () => void | Promise<void>
  isLoading?: boolean
  className?: string
}

export function RefreshButton({ onRefresh, isLoading, className }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  async function handleClick() {
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  const active = Boolean(isLoading) || isRefreshing

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label="Actualiser"
      onClick={handleClick}
      disabled={active}
      className={className}
    >
      <RefreshCw className={cn("size-4", active && "animate-spin")} />
    </Button>
  )
}
