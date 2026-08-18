"use client"

import { useEffect, useState } from "react"
import {
  type DashboardDateRange,
  getDashboardLowStock,
  getDashboardSummary,
  getOrdersByStatus,
  getPaymentsBreakdown,
  getPromoUsage,
  getRevenueTimeseries,
  getTopCategories,
  getTopProducts,
} from "@/lib/services/admin/dashboard.service"
import type {
  DashboardSummary,
  LowStockItem,
  OrdersByStatusEntry,
  PaymentBreakdownEntry,
  PromoUsageEntry,
  RevenueTimeseriesPoint,
  TopCategoryEntry,
  TopProductEntry,
} from "@/types"

export interface UseAdminDashboardResult {
  summary: DashboardSummary | null
  revenueTimeseries: RevenueTimeseriesPoint[]
  ordersByStatus: OrdersByStatusEntry[]
  paymentsBreakdown: PaymentBreakdownEntry[]
  topProducts: TopProductEntry[]
  topCategories: TopCategoryEntry[]
  lowStock: LowStockItem[]
  promoUsage: PromoUsageEntry[]
  isLoading: boolean
  error: string | null
}

const DEFAULT_RANGE_DAYS = 30

// The API omits days with no orders from revenue-timeseries; fill them in
// with zeroes so the chart's x-axis stays continuous across the range.
function fillRevenueSeries(
  points: RevenueTimeseriesPoint[],
  range: DashboardDateRange
): RevenueTimeseriesPoint[] {
  const to = range.to ? new Date(range.to) : new Date()
  const from = range.from
    ? new Date(range.from)
    : new Date(new Date(to).setDate(to.getDate() - DEFAULT_RANGE_DAYS))

  const byDate = new Map(points.map((p) => [p.date, p]))
  const filled: RevenueTimeseriesPoint[] = []
  const cursor = new Date(from)
  cursor.setHours(0, 0, 0, 0)
  const end = new Date(to)
  end.setHours(0, 0, 0, 0)

  while (cursor <= end) {
    const date = cursor.toISOString().slice(0, 10)
    filled.push(byDate.get(date) ?? { date, revenue: 0, orderCount: 0 })
    cursor.setDate(cursor.getDate() + 1)
  }

  return filled
}

export function useAdminDashboard(range: DashboardDateRange): UseAdminDashboardResult {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [revenueTimeseries, setRevenueTimeseries] = useState<RevenueTimeseriesPoint[]>([])
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatusEntry[]>([])
  const [paymentsBreakdown, setPaymentsBreakdown] = useState<PaymentBreakdownEntry[]>([])
  const [topProducts, setTopProducts] = useState<TopProductEntry[]>([])
  const [topCategories, setTopCategories] = useState<TopCategoryEntry[]>([])
  const [lowStock, setLowStock] = useState<LowStockItem[]>([])
  const [promoUsage, setPromoUsage] = useState<PromoUsageEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const [
          summaryData,
          revenueData,
          ordersByStatusData,
          paymentsData,
          topProductsData,
          topCategoriesData,
          lowStockData,
          promoUsageData,
        ] = await Promise.all([
          getDashboardSummary(range),
          getRevenueTimeseries(range),
          getOrdersByStatus(),
          getPaymentsBreakdown(range),
          getTopProducts(range),
          getTopCategories(range),
          getDashboardLowStock(),
          getPromoUsage(),
        ])

        if (!cancelled) {
          setSummary(summaryData)
          setRevenueTimeseries(fillRevenueSeries(revenueData, range))
          setOrdersByStatus(ordersByStatusData)
          setPaymentsBreakdown(paymentsData)
          setTopProducts(topProductsData)
          setTopCategories(topCategoriesData)
          setLowStock(lowStockData)
          setPromoUsage(promoUsageData)
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
    // Depend on the primitive from/to values rather than `range` itself —
    // callers pass a new object each render, which would refetch on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to])

  return {
    summary,
    revenueTimeseries,
    ordersByStatus,
    paymentsBreakdown,
    topProducts,
    topCategories,
    lowStock,
    promoUsage,
    isLoading,
    error,
  }
}
