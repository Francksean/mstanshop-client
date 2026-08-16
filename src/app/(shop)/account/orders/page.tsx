"use client"

import { useTranslations } from "next-intl"
import { OrderHistoryList } from "@/components/custom/OrderHistoryList"
import { CartItemShimmer } from "@/components/custom/PageShimmers/CartItemShimmer"
import { useOrders } from "@/hooks/useOrders"

export default function OrdersPage() {
  const t = useTranslations("account.orders")
  const { orders, isLoading, error, refetch } = useOrders()

  if (isLoading) {
    return (
      <div className="rounded-md bg-card p-8">
        <CartItemShimmer />
        <CartItemShimmer />
        <CartItemShimmer />
      </div>
    )
  }

  if (error) {
    return <p className="text-body text-sangria">{error}</p>
  }

  return (
    <div className="rounded-md bg-card p-4 sm:p-8">
      <h2 className="mb-2 text-h2 text-ink">{t("title")}</h2>
      <OrderHistoryList orders={orders} onCancelled={refetch} />
    </div>
  )
}
