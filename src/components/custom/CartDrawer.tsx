"use client"

import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { CartLineItem } from "./CartLineItem"
import { EmptyState } from "./EmptyState"
import { SuggestedProducts } from "./SuggestedProducts"
import { formatPrice } from "@/lib/utils"
import { useCart } from "@/hooks/useCart"

export function CartDrawer() {
  const t = useTranslations("cart")
  const locale = useLocale()
  const { items, subtotal, isDrawerOpen, closeDrawer } = useCart()

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 bg-background sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-h2">{t("drawerTitle", { count: items.length })}</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 overflow-y-auto">
            <EmptyState
              title={t("emptyTitle")}
              description={t("emptyDescription")}
              ctaLabel={t("emptyCta")}
              ctaHref="/products"
            />
            <SuggestedProducts compact limit={4} className="px-4 pb-6" />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              {items.map((item) => (
                <CartLineItem key={item.id} item={item} />
              ))}
              <SuggestedProducts compact limit={4} className="pt-4 pb-2" />
            </div>
            <div className="flex flex-col gap-3 border-t border-black/10 p-4">
              <div className="flex justify-between text-h2 font-semibold text-ink">
                <span>{t("total")}</span>
                <span>{formatPrice(subtotal, locale)}</span>
              </div>
              <Button asChild size="lg" onClick={closeDrawer}>
                <Link href="/cart">{t("viewCart")}</Link>
              </Button>
              <Button type="button" size="lg" variant="outline" onClick={closeDrawer}>
                {t("continueShopping")}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
