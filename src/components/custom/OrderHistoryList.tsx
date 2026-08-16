"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import { OrderStatusBadge } from "./OrderStatusBadge"
import { EmptyState } from "./EmptyState"
import { OrderDetailDialog } from "./OrderDetailDialog"
import { Button } from "@/components/ui/button"
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog"
import { cancelOrder } from "@/lib/services/orders.service"
import { formatPrice } from "@/lib/utils"
import type { OrderStatus, OrderSummary } from "@/types"

const CANCELLABLE_STATUSES: OrderStatus[] = ["EN_ATTENTE", "PAYEE"]

export function OrderHistoryList({
  orders,
  onCancelled,
}: {
  orders: OrderSummary[]
  onCancelled?: () => void
}) {
  const t = useTranslations("account.orders")
  const tCommon = useTranslations("common.actions")
  const locale = useLocale()
  const format = useFormatter()
  const [cancelling, setCancelling] = useState<OrderSummary | null>(null)
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null)

  if (orders.length === 0) {
    return (
      <EmptyState
        title={t("emptyTitle")}
        description={t("emptyDescription")}
        ctaLabel={t("emptyCta")}
        ctaHref="/products"
      />
    )
  }

  return (
    <div className="flex flex-col">
      {orders.map((order) => (
        <div
          key={order.id}
          role="button"
          tabIndex={0}
          onClick={() => setViewingOrderId(order.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setViewingOrderId(order.id)
            }
          }}
          className="flex cursor-pointer flex-col gap-3 border-b border-black/10 py-6 text-left transition-colors last:border-0 hover:bg-gold-light/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sangria sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        >
          <div className="flex flex-col gap-1">
            <span className="font-medium text-ink">#{order.reference}</span>
            <span className="text-small text-ink/60">
              {format.dateTime(new Date(order.createdAt), { day: "2-digit", month: "short", year: "numeric" })}
              {" · "}
              {formatPrice(order.total, locale)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {CANCELLABLE_STATUSES.includes(order.status) && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setCancelling(order)
                }}
              >
                {t("cancelButton")}
              </Button>
            )}
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
      ))}

      <DeleteConfirmDialog
        open={Boolean(cancelling)}
        onOpenChange={(open) => !open && setCancelling(null)}
        title={t("cancelDialogTitle")}
        description={t("cancelDialogDescription", { reference: cancelling?.reference ?? "" })}
        confirmLabel={t("cancelConfirm")}
        pendingLabel={t("cancelPending")}
        cancelLabel={tCommon("cancel")}
        onConfirm={async () => {
          if (!cancelling) return
          await cancelOrder(cancelling.id)
          toast.success(t("cancelled"))
          onCancelled?.()
        }}
      />

      <OrderDetailDialog orderId={viewingOrderId} onOpenChange={(open) => !open && setViewingOrderId(null)} />
    </div>
  )
}
