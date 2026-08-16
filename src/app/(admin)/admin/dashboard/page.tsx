"use client"

import { Euro, ShoppingCart, Users, TriangleAlert } from "lucide-react"
import { KpiCard, KpiCardShimmer } from "@/components/admin/KpiCard"
import { OrdersChart, OrdersChartShimmer } from "@/components/admin/OrdersChart"
import { useDashboardStats } from "@/hooks/admin/useDashboardStats"
import { formatPrice } from "@/lib/utils"

export default function AdminDashboardPage() {
  const { stats, isLoading, error } = useDashboardStats()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-h2 text-ink">Dashboard</h1>

      {error && <p className="text-body text-sangria">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !stats ? (
          <>
            <KpiCardShimmer />
            <KpiCardShimmer />
            <KpiCardShimmer />
            <KpiCardShimmer />
          </>
        ) : (
          <>
            <KpiCard label="Chiffre d'affaires total" value={formatPrice(stats.totalRevenue)} icon={Euro} accent="sangria" />
            <KpiCard label="Nombre de commandes" value={String(stats.orderCount)} icon={ShoppingCart} accent="gold" />
            <KpiCard label="Nombre d'utilisateurs" value={String(stats.userCount)} icon={Users} accent="delivered" />
            <KpiCard
              label={`Stock critique (< ${stats.lowStockThreshold})`}
              value={String(stats.lowStockCount)}
              icon={TriangleAlert}
              accent="sangria"
            />
          </>
        )}
      </div>

      {isLoading || !stats ? (
        <OrdersChartShimmer />
      ) : (
        <OrdersChart data={stats.ordersLast7Days} />
      )}
    </div>
  )
}
