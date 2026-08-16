"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog"
import { updateOrderStatus } from "@/lib/services/admin/orders.service"
import { STATUS_CONFIG } from "@/components/custom/OrderStatusBadge"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/types"

const STATUS_OPTIONS: OrderStatus[] = ["EN_ATTENTE", "PAYEE", "EXPEDIEE", "LIVREE", "ANNULEE"]

interface OrderStatusSelectProps {
  orderId: string
  status: OrderStatus
  onChanged: (status: OrderStatus) => void
}

export function OrderStatusSelect({ orderId, status, onChanged }: OrderStatusSelectProps) {
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null)

  async function performChange() {
    if (!pendingStatus) return
    await updateOrderStatus(orderId, pendingStatus)
    onChanged(pendingStatus)
    toast.success("Statut de la commande mis à jour.")
  }

  return (
    <>
      <Select value={status} onValueChange={(value) => setPendingStatus(value as OrderStatus)}>
        <SelectTrigger
          onClick={(e) => e.stopPropagation()}
          size="sm"
          aria-label="Changer le statut de la commande"
          className={cn("border-transparent font-medium", STATUS_CONFIG[status].className)}
        >
          <SelectValue>{STATUS_CONFIG[status].label}</SelectValue>
        </SelectTrigger>
        <SelectContent onClick={(e) => e.stopPropagation()}>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {STATUS_CONFIG[option].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DeleteConfirmDialog
        open={Boolean(pendingStatus)}
        onOpenChange={(v) => !v && setPendingStatus(null)}
        variant="default"
        title="Changer le statut de cette commande ?"
        description={pendingStatus ? `Le statut passera à "${STATUS_CONFIG[pendingStatus].label}".` : ""}
        confirmLabel="Confirmer"
        pendingLabel="Mise à jour…"
        onConfirm={performChange}
      />
    </>
  )
}
