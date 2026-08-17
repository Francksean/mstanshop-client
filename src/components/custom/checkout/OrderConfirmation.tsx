"use client"

import { useTranslations } from "next-intl"
import { Loader2, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CheckoutStepper } from "@/components/custom/CheckoutStepper"
import { OrderSummaryCard } from "@/components/custom/OrderSummaryCard"
import { SHIPPING_COSTS, type ShippingMethod } from "@/components/custom/ShippingMethodForm"
import type { Order } from "@/types"

export type PaymentPhase = "pending" | "success" | "failed" | "timeout"

interface OrderConfirmationProps {
  order: Order
  phase: PaymentPhase
  shippingMethod: ShippingMethod
  guestMode: boolean
  onRetry: () => void
  onContinue: () => void
}

export function OrderConfirmation({ order, phase, shippingMethod, guestMode, onRetry, onContinue }: OrderConfirmationProps) {
  const t = useTranslations("checkout")
  const tCommon = useTranslations("common.actions")

  if (phase === "pending" || phase === "timeout") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-8">
        <CheckoutStepper currentStep={4} />
        <Loader2 className="mx-auto mt-8 size-10 animate-spin text-sangria" />
        <h1 className="mt-6 text-h1 text-ink">{t("paymentPending.title")}</h1>
        <p className="mt-4 text-body text-ink/70">
          {t.rich("paymentPending.body", {
            phone: () => <span className="font-medium text-ink">{order.address.phone}</span>,
            reference: () => <span className="font-medium text-ink">#{order.reference}</span>,
          })}
        </p>
        {phase === "timeout" && (
          <p className="mt-4 rounded-md bg-gold-light/40 p-4 text-small text-ink/70">
            {t("paymentPending.timeoutNote")}
          </p>
        )}
      </div>
    )
  }

  if (phase === "failed") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-8">
        <CheckoutStepper currentStep={4} />
        <TriangleAlert className="mx-auto mt-8 size-10 text-sangria" />
        <h1 className="mt-6 text-h1 text-ink">{t("paymentFailed.title")}</h1>
        <p className="mt-4 text-body text-ink/70">
          {t.rich("paymentFailed.body", {
            reference: () => <span className="font-medium text-ink">#{order.reference}</span>,
          })}
        </p>
        <Button className="mt-8" onClick={onRetry}>
          {tCommon("retry")}
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-8">
      <CheckoutStepper currentStep={4} />
      <h1 className="mt-8 text-h1 text-ink">{t("success.title")}</h1>
      <p className="mt-4 text-body text-ink/70">
        {t.rich("success.body", {
          reference: () => <span className="font-medium text-ink">#{order.reference}</span>,
        })}{" "}
        {order.paymentMethod === "CASH_ON_DELIVERY"
          ? t("success.codNote")
          : order.paymentMethod === "PAYMENT_ON_PICKUP"
            ? t("success.pickupNote")
            : t("success.onlineNote")}
      </p>
      <div className="mt-8 text-left">
        <OrderSummaryCard
          subtotal={order.subtotal}
          shipping={SHIPPING_COSTS[shippingMethod]}
          discount={order.discount}
          promoCode={order.promoCode}
        />
      </div>
      <Button className="mt-8" onClick={onContinue}>
        {guestMode ? t("success.ctaGuest") : t("success.ctaAccount")}
      </Button>
    </div>
  )
}
