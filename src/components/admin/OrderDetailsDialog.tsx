"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ImagePlaceholder } from "@/components/custom/ImagePlaceholder"
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect"
import { cancelOrderAsAdmin, confirmCashPayment } from "@/lib/services/admin/orders.service"
import { normalizeError } from "@/lib/api-error"
import { formatPrice, resolveMediaUrl } from "@/lib/utils"
import type { Order, OrderStatus } from "@/types"

const CANCELLABLE_STATUSES: Order["status"][] = ["EN_ATTENTE", "PAYEE"]

interface OrderDetailsDialogProps {
  order: Order | null
  onOpenChange: (open: boolean) => void
  onCancelled?: () => void
  onCashConfirmed?: () => void
  onStatusChanged?: () => void
}

export function OrderDetailsDialog({
  order,
  onOpenChange,
  onCancelled,
  onCashConfirmed,
  onStatusChanged,
}: OrderDetailsDialogProps) {
  const [isCancelling, setIsCancelling] = useState(false)
  const [isConfirmingCash, setIsConfirmingCash] = useState(false)

  const awaitingCash =
    (order?.paymentMethod === "CASH_ON_DELIVERY" || order?.paymentMethod === "PAYMENT_ON_PICKUP") &&
    order.paymentStatus === "PENDING"

  async function handleCancel() {
    if (!order) return
    setIsCancelling(true)
    try {
      await cancelOrderAsAdmin(order.id)
      toast.success("Commande annulée.")
      onOpenChange(false)
      onCancelled?.()
    } catch (error) {
      toast.error(normalizeError(error).message)
    } finally {
      setIsCancelling(false)
    }
  }

  async function handleConfirmCash() {
    if (!order) return
    setIsConfirmingCash(true)
    try {
      await confirmCashPayment(order.id)
      toast.success("Encaissement confirmé.")
      onOpenChange(false)
      onCashConfirmed?.()
    } catch (error) {
      toast.error(normalizeError(error).message)
    } finally {
      setIsConfirmingCash(false)
    }
  }

  function handleStatusChanged(_status: OrderStatus) {
    void _status
    onOpenChange(false)
    onStatusChanged?.()
  }

  return (
    <Dialog open={Boolean(order)} onOpenChange={(open) => !open && onOpenChange(false)}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {order && (
          <>
            <DialogHeader>
              <DialogTitle className="flex flex-wrap items-center gap-2">
                Commande #{order.reference}
                {awaitingCash && (
                  <span className="rounded-full bg-gold-light px-2 py-0.5 text-small font-medium text-ink">
                    À encaisser
                  </span>
                )}
                <span className="ml-auto">
                  <OrderStatusSelect orderId={order.id} status={order.status} onChanged={handleStatusChanged} />
                </span>
              </DialogTitle>
              <DialogDescription>
                {order.customer?.firstName ? `${order.customer.firstName} ${order.customer.lastName}` : "Invité"}
                {order.customer?.email ? ` · ${order.customer.email}` : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <h3 className="text-small font-medium tracking-wide text-ink/60 uppercase">Articles</h3>
              {order.items.map((item, i) => (
                <div
                  key={`${item.productId}-${item.variantId ?? i}`}
                  className="flex items-center justify-between gap-3 text-body text-ink"
                >
                  <div className="flex items-center gap-3">
                    {item.productThumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolveMediaUrl(item.productThumbnailUrl)}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <ImagePlaceholder aspectRatio="square" label="" className="h-10 w-10 shrink-0 rounded-md" />
                    )}
                    <span>
                      {item.name}
                      {(item.variantColorName || item.variantSize)
                        ? ` (${[item.variantColorName, item.variantSize].filter(Boolean).join(" · ")})`
                        : ""}{" "}
                      × {item.quantity}
                    </span>
                  </div>
                  <span>{formatPrice(item.lineTotal)}</span>
                </div>
              ))}
              <Separator />
              {(order.discount ?? 0) > 0 && (
                <>
                  <div className="flex justify-between text-body text-ink/60">
                    <span>Sous-total</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-body text-delivered">
                    <span>Réduction{order.promoCode ? ` (${order.promoCode})` : ""}</span>
                    <span>-{formatPrice(order.discount ?? 0)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-h2 font-semibold text-ink">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-small font-medium tracking-wide text-ink/60 uppercase">Paiement</h3>
              <p className="text-body text-ink/80">
                {order.paymentMethod === "CASH_ON_DELIVERY"
                  ? "Paiement à la livraison"
                  : order.paymentMethod === "PAYMENT_ON_PICKUP"
                    ? "Paiement à la récupération en boutique"
                    : "Mobile Money"}
                {order.paymentStatus && ` · ${order.paymentStatus}`}
                {order.paymentReference && (
                  <>
                    <br />
                    Réf. {order.paymentReference}
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-small font-medium tracking-wide text-ink/60 uppercase">
                Adresse de livraison
              </h3>
              <p className="text-body text-ink/80">
                {(order.address.firstName || order.address.lastName) && (
                  <>
                    {order.address.firstName} {order.address.lastName}
                    <br />
                  </>
                )}
                {order.address.street}
                <br />
                {order.address.postalCode} {order.address.city}, {order.address.country}
                {order.address.phone && (
                  <>
                    <br />
                    Tél. {order.address.phone}
                  </>
                )}
                {order.address.whatsapp && (
                  <>
                    <br />
                    WhatsApp {order.address.whatsapp}
                  </>
                )}
              </p>
            </div>

            {(awaitingCash || CANCELLABLE_STATUSES.includes(order.status)) && (
              <DialogFooter>
                {awaitingCash && (
                  <Button onClick={handleConfirmCash} disabled={isConfirmingCash}>
                    {isConfirmingCash ? "Confirmation…" : "Confirmer la réception du paiement"}
                  </Button>
                )}
                {CANCELLABLE_STATUSES.includes(order.status) && (
                  <Button variant="destructive" onClick={handleCancel} disabled={isCancelling}>
                    {isCancelling ? "Annulation…" : "Annuler la commande"}
                  </Button>
                )}
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
