"use client"

import { useMemo, useState } from "react"
import { Clock, Euro, Mail, Receipt, ShoppingCart, TriangleAlert } from "lucide-react"
import { KpiCard, KpiCardShimmer } from "@/components/admin/KpiCard"
import { RevenueChart, RevenueChartShimmer } from "@/components/admin/RevenueChart"
import { OrdersByStatusChart, OrdersByStatusChartShimmer } from "@/components/admin/OrdersByStatusChart"
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard"
import type { DashboardDateRange } from "@/lib/services/admin/dashboard.service"
import { formatPrice } from "@/lib/utils"
import type {
  LowStockItem,
  OrderPaymentMethod,
  PaymentBreakdownEntry,
  PaymentStatus,
  PromoUsageEntry,
  TopCategoryEntry,
  TopProductEntry,
} from "@/types"

type RangePreset = "7" | "30" | "90" | "custom"

const PAYMENT_METHOD_LABELS: Record<OrderPaymentMethod, string> = {
  MOBILE_PAYMENT: "Mobile Money",
  CASH_ON_DELIVERY: "Paiement à la livraison",
  PAYMENT_ON_PICKUP: "Paiement au retrait",
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "En attente",
  SUCCESSFUL: "Réussi",
  FAILED: "Échoué",
}

function computeRange(preset: RangePreset, customFrom: string, customTo: string): DashboardDateRange {
  if (preset === "custom") {
    return {
      from: customFrom ? new Date(`${customFrom}T00:00:00`).toISOString() : undefined,
      to: customTo ? new Date(`${customTo}T23:59:59`).toISOString() : undefined,
    }
  }
  const days = Number(preset)
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - days)
  return { from: from.toISOString(), to: to.toISOString() }
}

export default function AdminDashboardPage() {
  const [preset, setPreset] = useState<RangePreset>("30")
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")

  const range = useMemo(() => computeRange(preset, customFrom, customTo), [preset, customFrom, customTo])

  const {
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
  } = useAdminDashboard(range)

  const paymentColumns: DataTableColumn<PaymentBreakdownEntry>[] = [
    {
      key: "method",
      header: "Méthode",
      mobileTitle: true,
      render: (p) => PAYMENT_METHOD_LABELS[p.method],
    },
    { key: "status", header: "Statut", render: (p) => PAYMENT_STATUS_LABELS[p.status] },
    { key: "count", header: "Nombre", sortAccessor: (p) => p.count, render: (p) => p.count },
    { key: "amount", header: "Montant", sortAccessor: (p) => p.amount, render: (p) => formatPrice(p.amount) },
  ]

  const topProductColumns: DataTableColumn<TopProductEntry>[] = [
    { key: "productName", header: "Produit", mobileTitle: true, render: (p) => p.productName },
    {
      key: "quantitySold",
      header: "Quantité vendue",
      sortAccessor: (p) => p.quantitySold,
      render: (p) => p.quantitySold,
    },
    { key: "revenue", header: "CA", sortAccessor: (p) => p.revenue, render: (p) => formatPrice(p.revenue) },
  ]

  const topCategoryColumns: DataTableColumn<TopCategoryEntry>[] = [
    { key: "categoryName", header: "Catégorie", mobileTitle: true, render: (c) => c.categoryName },
    {
      key: "quantitySold",
      header: "Quantité vendue",
      sortAccessor: (c) => c.quantitySold,
      render: (c) => c.quantitySold,
    },
    { key: "revenue", header: "CA", sortAccessor: (c) => c.revenue, render: (c) => formatPrice(c.revenue) },
  ]

  const lowStockColumns: DataTableColumn<LowStockItem>[] = [
    { key: "productName", header: "Produit", mobileTitle: true, render: (i) => i.productName },
    {
      key: "variant",
      header: "Variante",
      render: (i) => [i.variantColorName, i.variantSize].filter(Boolean).join(" / ") || "—",
    },
    {
      key: "currentStock",
      header: "Stock actuel",
      sortAccessor: (i) => i.currentStock,
      render: (i) => i.currentStock,
    },
    { key: "threshold", header: "Seuil", sortAccessor: (i) => i.threshold, render: (i) => i.threshold },
  ]

  const promoUsageColumns: DataTableColumn<PromoUsageEntry>[] = [
    { key: "code", header: "Code", mobileTitle: true, render: (p) => p.code },
    {
      key: "usesCount",
      header: "Utilisations",
      sortAccessor: (p) => p.usesCount,
      render: (p) => p.usesCount,
    },
    {
      key: "totalDiscount",
      header: "Remise totale",
      sortAccessor: (p) => p.totalDiscount,
      render: (p) => formatPrice(p.totalDiscount),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h2 text-ink">Dashboard</h1>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={preset} onValueChange={(v) => setPreset(v as RangePreset)}>
            <SelectTrigger size="sm" aria-label="Plage de dates" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">90 derniers jours</SelectItem>
              <SelectItem value="custom">Personnalisé</SelectItem>
            </SelectContent>
          </Select>

          {preset === "custom" && (
            <>
              <Input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                aria-label="Date de début"
                className="h-8 w-36"
              />
              <Input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                aria-label="Date de fin"
                className="h-8 w-36"
              />
            </>
          )}
        </div>
      </div>

      {error && <p className="text-body text-sangria">{error}</p>}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {isLoading || !summary ? (
          <>
            <KpiCardShimmer />
            <KpiCardShimmer />
            <KpiCardShimmer />
            <KpiCardShimmer />
            <KpiCardShimmer />
            <KpiCardShimmer />
          </>
        ) : (
          <>
            <KpiCard label="Chiffre d'affaires" value={formatPrice(summary.revenue)} icon={Euro} accent="sangria" />
            <KpiCard label="Commandes" value={String(summary.orderCount)} icon={ShoppingCart} accent="gold" />
            <KpiCard label="Panier moyen" value={formatPrice(summary.averageBasket)} icon={Receipt} accent="delivered" />
            <KpiCard label="Commandes en attente" value={String(summary.pendingOrders)} icon={Clock} accent="gold" />
            <KpiCard
              label="Stock critique"
              value={String(summary.lowStockCount)}
              icon={TriangleAlert}
              accent="sangria"
            />
            <KpiCard
              label="Nouveaux abonnés newsletter"
              value={String(summary.newNewsletterSubscribers)}
              icon={Mail}
              accent="delivered"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {isLoading ? <RevenueChartShimmer /> : <RevenueChart data={revenueTimeseries} />}
        {isLoading ? <OrdersByStatusChartShimmer /> : <OrdersByStatusChart data={ordersByStatus} />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paiements</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={paymentColumns}
            rows={paymentsBreakdown}
            rowKey={(p) => `${p.method}-${p.status}`}
            isLoading={isLoading}
            emptyTitle="Aucun paiement"
            emptyDescription="Aucun paiement sur cette période."
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top produits</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={topProductColumns}
              rows={topProducts}
              rowKey={(p) => p.productId}
              isLoading={isLoading}
              emptyTitle="Aucun produit vendu"
              emptyDescription="Aucune vente sur cette période."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top catégories</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={topCategoryColumns}
              rows={topCategories}
              rowKey={(c) => c.categoryId}
              isLoading={isLoading}
              emptyTitle="Aucune catégorie vendue"
              emptyDescription="Aucune vente sur cette période."
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock bas</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={lowStockColumns}
            rows={lowStock}
            rowKey={(i) => i.variantId ?? i.productId}
            isLoading={isLoading}
            emptyTitle="Aucun stock critique"
            emptyDescription="Tous les produits sont au-dessus du seuil d'alerte."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Codes promo</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={promoUsageColumns}
            rows={promoUsage}
            rowKey={(p) => p.code}
            isLoading={isLoading}
            emptyTitle="Aucun code promo utilisé"
            emptyDescription="Aucun code promo n'a encore été utilisé."
          />
        </CardContent>
      </Card>
    </div>
  )
}
