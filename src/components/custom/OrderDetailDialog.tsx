"use client"

import { useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { OrderStatusBadge } from "./OrderStatusBadge"
import { ImagePlaceholder } from "./ImagePlaceholder"
import { getOrderById } from "@/lib/services/orders.service"
import { normalizeError } from "@/lib/api-error"
import { formatPrice, resolveMediaUrl } from "@/lib/utils"
import type { Order } from "@/types"

interface OrderDetailDialogProps {
  orderId: string | null
  onOpenChange: (open: boolean) => void
}

export function OrderDetailDialog({ orderId, onOpenChange }: OrderDetailDialogProps) {
  const t = useTranslations("account.orders.detail")
  const tCommon = useTranslations("common.actions")
  const tApiErrors = useTranslations("apiErrors")
  const locale = useLocale()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true)
    setError(null)
    getOrderById(orderId)
      .then((data) => {
        if (!cancelled) setOrder(data)
      })
      .catch((err) => {
        if (!cancelled) setError(normalizeError(err, tApiErrors).message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  return (
    <Dialog open={Boolean(orderId)} onOpenChange={(open) => !open && onOpenChange(false)}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {isLoading && <p className="text-body text-ink/60">{tCommon("loading")}</p>}
        {error && <p className="text-body text-sangria">{error}</p>}

        {order && !isLoading && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {t("title", { reference: order.reference })}
                <OrderStatusBadge status={order.status} />
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3">
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
                        className="h-14 w-14 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <ImagePlaceholder aspectRatio="square" label="" className="h-14 w-14 shrink-0 rounded-md" />
                    )}
                    <span className="flex flex-col">
                      <span>
                        {item.name}
                        {(item.variantColorName || item.variantSize)
                          ? ` (${[item.variantColorName, item.variantSize].filter(Boolean).join(" · ")})`
                          : ""}
                      </span>
                      <span className="text-small text-ink/50">{t("quantity", { count: item.quantity })}</span>
                    </span>
                  </div>
                  <span>{formatPrice(item.lineTotal, locale)}</span>
                </div>
              ))}

              <Separator />

              <div className="flex flex-col gap-1 text-body">
                <div className="flex justify-between text-ink/70">
                  <span>{t("subtotal")}</span>
                  <span>{formatPrice(order.subtotal, locale)}</span>
                </div>
                {Boolean(order.discount) && (
                  <div className="flex justify-between text-sangria">
                    <span>
                      {t("discount")}
                      {order.promoCode ? ` (${order.promoCode})` : ""}
                    </span>
                    <span>-{formatPrice(order.discount ?? 0, locale)}</span>
                  </div>
                )}
                <div className="flex justify-between text-h2 font-semibold text-ink">
                  <span>{t("total")}</span>
                  <span>{formatPrice(order.total, locale)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-small font-medium tracking-wide text-ink/60 uppercase">
                {t("shippingAddress")}
              </h3>
              <p className="text-body text-ink/80">
                {order.address.street}
                <br />
                {order.address.postalCode} {order.address.city}, {order.address.country}
                {order.address.phone && (
                  <>
                    <br />
                    {order.address.phone}
                  </>
                )}
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
