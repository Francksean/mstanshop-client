"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { CartLineItem } from "@/components/custom/CartLineItem"
import { OrderSummaryCard } from "@/components/custom/OrderSummaryCard"
import { EmptyState } from "@/components/custom/EmptyState"
import { SuggestedProducts } from "@/components/custom/SuggestedProducts"
import { TrustBadges } from "@/components/custom/TrustBadges"
import { useCart } from "@/hooks/useCart"

export default function CartPage() {
  const t = useTranslations("cart")
  const { items, subtotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} ctaLabel={t("emptyCta")} ctaHref="/products" />
        <TrustBadges variant="inline" className="mt-12" />
        <SuggestedProducts className="mt-16 border-t border-black/10 pt-10" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <h1 className="mb-8 text-h1 text-ink">{t("drawerTitle", { count: items.length })}</h1>
      <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_360px]">
        <div>
          {items.map((item) => (
            <CartLineItem key={item.id} item={item} />
          ))}
        </div>
        <div className="md:sticky md:top-24 md:self-start">
          <OrderSummaryCard
            subtotal={subtotal}
            action={
              <div className="mt-2 flex flex-col gap-2">
                <Button asChild size="lg">
                  <Link href="/checkout">{t("proceedToCheckout")}</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/products">{t("continueShopping")}</Link>
                </Button>
              </div>
            }
          />
        </div>
      </div>

      <TrustBadges variant="inline" className="mt-12 border-t border-black/10 pt-10" />
      <SuggestedProducts className="mt-16 border-t border-black/10 pt-10" />
    </div>
  )
}
