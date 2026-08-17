"use client"

import { X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { ImagePlaceholder } from "./ImagePlaceholder"
import { Button } from "@/components/ui/button"
import { formatPrice, resolveMediaUrl } from "@/lib/utils"
import { useCart } from "@/hooks/useCart"
import type { CartItem } from "@/types"

export function CartLineItem({ item }: { item: CartItem }) {
  const t = useTranslations("cart")
  const locale = useLocale()
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className="flex items-start gap-3 border-b border-black/10 py-6 last:border-0 sm:gap-4">
      {item.productThumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolveMediaUrl(item.productThumbnailUrl)}
          alt=""
          className="h-16 w-16 shrink-0 rounded-md object-cover sm:h-20 sm:w-20"
        />
      ) : (
        <ImagePlaceholder aspectRatio="square" className="h-16 w-16 shrink-0 sm:h-20 sm:w-20" label="" />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <span className="line-clamp-2 text-body font-medium text-ink">{item.productName}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("removeItem")}
            className="-mt-1 -mr-1 shrink-0"
            onClick={() => removeItem(item.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {(item.variantColorName || item.variantSize) && (
          <span className="inline-flex items-center gap-1.5 text-small text-ink/60">
            {item.variantColorHex && (
              <span
                className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: item.variantColorHex }}
              />
            )}
            {item.variantColorName && <span>{item.variantColorName}</span>}
            {item.variantColorName && item.variantSize && <span aria-hidden>·</span>}
            {item.variantSize && (
              <span className="rounded-sm border border-black/10 px-1.5 py-px font-medium text-ink/70">
                {item.variantSize}
              </span>
            )}
          </span>
        )}

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={t("decreaseQuantity")}
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-black/10 text-ink disabled:opacity-40"
            >
              −
            </button>
            <span className="w-6 text-center text-body" aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label={t("increaseQuantity")}
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-black/10 text-ink disabled:opacity-40"
            >
              +
            </button>
          </div>
          <span className="shrink-0 font-semibold text-ink">{formatPrice(item.lineTotal, locale)}</span>
        </div>
      </div>
    </div>
  )
}
