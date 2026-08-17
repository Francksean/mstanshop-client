"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable"
import { OrderDetailsDialog } from "@/components/admin/OrderDetailsDialog"
import { OrderStatusBadge, STATUS_CONFIG } from "@/components/custom/OrderStatusBadge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAdminOrders } from "@/hooks/admin/useAdminOrders"
import { getOrderById } from "@/lib/services/admin/orders.service"
import { normalizeError } from "@/lib/api-error"
import { formatPrice } from "@/lib/utils"
import type { Order, OrderStatus, OrderSummary } from "@/types"

const ALL_STATUSES = "ALL"
const STATUS_OPTIONS: OrderStatus[] = ["EN_ATTENTE", "PAYEE", "EXPEDIEE", "LIVREE", "ANNULEE"]

export default function AdminOrdersPage() {
  const {
    items,
    page,
    totalPages,
    totalElements,
    pageSize,
    isLoading,
    error,
    search,
    status,
    setSearch,
    setStatus,
    setPageSize,
    setPage,
    refetch,
  } = useAdminOrders()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  async function handleRowClick(row: OrderSummary) {
    try {
      const order = await getOrderById(row.id)
      setSelectedOrder(order)
    } catch (err) {
      toast.error(normalizeError(err).message)
    }
  }

  const columns: DataTableColumn<OrderSummary>[] = [
    {
      key: "reference",
      header: "N° commande",
      mobileTitle: true,
      render: (o) => <span className="font-medium text-ink">#{o.reference}</span>,
    },
    {
      key: "customer",
      header: "Client",
      render: (o) => (o.customer?.firstName ? `${o.customer.firstName} ${o.customer.lastName}` : "Invité"),
    },
    {
      key: "date",
      header: "Date",
      sortAccessor: (o) => new Date(o.createdAt).getTime(),
      render: (o) =>
        new Date(o.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
    },
    { key: "total", header: "Montant", sortAccessor: (o) => o.total, render: (o) => formatPrice(o.total) },
    {
      key: "status",
      header: "Statut",
      mobileAction: true,
      render: (o) => <OrderStatusBadge status={o.status} />,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-h2 text-ink">Commandes</h1>

      {error && <p className="text-body text-sangria">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={status ?? ALL_STATUSES}
          onValueChange={(v) => setStatus(v === ALL_STATUSES ? undefined : (v as OrderStatus))}
        >
          <SelectTrigger size="sm" aria-label="Filtrer par statut" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUSES}>Tous les statuts</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {STATUS_CONFIG[option].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(o) => o.id}
        isLoading={isLoading}
        emptyTitle="Aucune commande"
        emptyDescription="Les commandes passées par vos clients apparaîtront ici."
        pagination={{
          page,
          totalPages,
          totalElements,
          pageSize,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
          zeroIndexed: true,
        }}
        onRowClick={handleRowClick}
        search={{ value: search, onChange: setSearch, placeholder: "Rechercher un n° de commande…" }}
      />

      <OrderDetailsDialog
        order={selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
        onCancelled={refetch}
        onCashConfirmed={refetch}
        onStatusChanged={refetch}
      />
    </div>
  )
}
