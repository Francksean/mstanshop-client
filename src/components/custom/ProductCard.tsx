"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { ShoppingBag } from "lucide-react"
import { ImagePlaceholder } from "./ImagePlaceholder"
import { PriceTag } from "./PriceTag"
import { StockBadge } from "./StockBadge"
import { ReviewStars } from "./ReviewStars"
import { Button } from "@/components/ui/button"
import { resolveMediaUrl } from "@/lib/utils"
import { useCart } from "@/hooks/useCart"
import type { Product } from "@/types"

export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations("products")
  const thumbnail = product.images[0]?.url
  const { addItem } = useCart()

  function handleBuy(e: React.MouseEvent) {
    e.preventDefault()
    addItem({
      productId: product.id,
      quantity: 1,
      productName: product.name,
      unitPrice: product.price,
      productThumbnailUrl: thumbnail,
    })
  }

  return (
    <div className="group flex h-full flex-col gap-3 rounded-md p-2 transition-colors hover:bg-gold-light/40">
      <Link
        href={`/products/${product.id}`}
        className="flex flex-1 flex-col gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sangria"
      >
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveMediaUrl(thumbnail)}
            alt={product.name}
            className="aspect-[4/3] w-full rounded-md object-cover transition-colors group-hover:brightness-95"
          />
        ) : (
          <ImagePlaceholder aspectRatio="wide" className="transition-colors group-hover:bg-sangria/5" />
        )}
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="font-heading text-body font-medium text-ink">{product.name}</h3>
          <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} />
          {product.reviewCount > 0 && (
            <ReviewStars rating={product.averageRating ?? 0} reviewCount={product.reviewCount} />
          )}
          <StockBadge stock={product.stock} />
        </div>
      </Link>

      <Button
        size="lg"
        className="mt-auto mb-1 w-full gap-2 text-base"
        disabled={product.stock === 0}
        onClick={handleBuy}
      >
        <ShoppingBag className="size-5" />
        {t("buy")}
      </Button>
    </div>
  )
}
