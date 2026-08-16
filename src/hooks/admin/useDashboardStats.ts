"use client"

import { useEffect, useState } from "react"
import { getAllOrders } from "@/lib/services/admin/orders.service"
import { getAllUsers } from "@/lib/services/admin/users.service"
import { getLowStockItems } from "@/lib/services/admin/products.service"

export interface DashboardStats {
  totalRevenue: number
  orderCount: number
  userCount: number
  lowStockCount: number
  lowStockThreshold: number
  ordersLast7Days: { date: string; label: string; count: number }[]
}

function last7DaysBuckets(): { date: string; label: string; count: number }[] {
  const days: { date: string; label: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("fr-FR", { weekday: "short" }),
      count: 0,
    })
  }
  return days
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const [orders, users, lowStockItems] = await Promise.all([
          getAllOrders({ page: 0, size: 200 }),
          getAllUsers({ page: 0, size: 200 }),
          getLowStockItems(),
        ])

        const totalRevenue = orders.items
          .filter((o) => o.status !== "ANNULEE")
          .reduce((sum, o) => sum + o.total, 0)

        const lowStockCount = lowStockItems.length
        const lowStockThreshold = lowStockItems[0]?.threshold ?? 5

        const buckets = last7DaysBuckets()
        for (const order of orders.items) {
          const day = order.createdAt.slice(0, 10)
          const bucket = buckets.find((b) => b.date === day)
          if (bucket) bucket.count += 1
        }

        if (!cancelled) {
          setStats({
            totalRevenue,
            orderCount: orders.totalElements,
            userCount: users.totalElements,
            lowStockCount,
            lowStockThreshold,
            ordersLast7Days: buckets,
          })
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Impossible de charger le tableau de bord.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { stats, isLoading, error }
}
