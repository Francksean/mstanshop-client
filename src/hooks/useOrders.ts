"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { getOrders } from "@/lib/services/orders.service"
import { normalizeError } from "@/lib/api-error"
import type { OrderSummary } from "@/types"

export function useOrders(): {
  orders: OrderSummary[]
  isLoading: boolean
  error: string | null
  refetch: () => void
} {
  const t = useTranslations("apiErrors")
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(() => {
    let cancelled = false
    setIsLoading(true)
    getOrders()
      .then((data) => {
        if (!cancelled) setOrders(data)
      })
      .catch((err) => {
        if (!cancelled) setError(normalizeError(err, t).message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [t])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    return refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { orders, isLoading, error, refetch }
}
