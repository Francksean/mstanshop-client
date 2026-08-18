import { apiClient } from "@/lib/api-client"
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

export interface DashboardDateRange {
  from?: string
  to?: string
}

export async function getDashboardSummary(range: DashboardDateRange = {}): Promise<DashboardSummary> {
  const { data } = await apiClient.get<DashboardSummary>("/admin/dashboard/summary", { params: range })
  return data
}

export async function getRevenueTimeseries(range: DashboardDateRange = {}): Promise<RevenueTimeseriesPoint[]> {
  const { data } = await apiClient.get<RevenueTimeseriesPoint[]>("/admin/dashboard/revenue-timeseries", {
    params: range,
  })
  return data
}

export async function getOrdersByStatus(): Promise<OrdersByStatusEntry[]> {
  const { data } = await apiClient.get<OrdersByStatusEntry[]>("/admin/dashboard/orders-by-status")
  return data
}

export async function getPaymentsBreakdown(range: DashboardDateRange = {}): Promise<PaymentBreakdownEntry[]> {
  const { data } = await apiClient.get<PaymentBreakdownEntry[]>("/admin/dashboard/payments-breakdown", {
    params: range,
  })
  return data
}

export async function getTopProducts(
  range: DashboardDateRange & { limit?: number } = {}
): Promise<TopProductEntry[]> {
  const { data } = await apiClient.get<TopProductEntry[]>("/admin/dashboard/top-products", { params: range })
  return data
}

export async function getTopCategories(
  range: DashboardDateRange & { limit?: number } = {}
): Promise<TopCategoryEntry[]> {
  const { data } = await apiClient.get<TopCategoryEntry[]>("/admin/dashboard/top-categories", { params: range })
  return data
}

export async function getDashboardLowStock(): Promise<LowStockItem[]> {
  const { data } = await apiClient.get<LowStockItem[]>("/admin/dashboard/low-stock")
  return data
}

export async function getPromoUsage(): Promise<PromoUsageEntry[]> {
  const { data } = await apiClient.get<PromoUsageEntry[]>("/admin/dashboard/promo-usage")
  return data
}
