"use client"

import { useEffect, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ImageGallery } from "@/components/custom/ImageGallery"
import { ReviewStars } from "@/components/custom/ReviewStars"
import { Skeleton } from "@/components/ui/skeleton"
import { getProductById } from "@/lib/services/products.service"
import { formatPrice } from "@/lib/utils"
import { normalizeError } from "@/lib/api-error"
import { cn } from "@/lib/utils"
import type { Product } from "@/types"

interface ProductDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string | null
}

export function ProductDetailSheet({ open, onOpenChange, productId }: ProductDetailSheetProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !productId) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true)
    setError(null)
    getProductById(productId)
      .then((data) => {
        if (!cancelled) setProduct(data)
      })
      .catch((err) => {
        if (!cancelled) setError(normalizeError(err).message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, productId])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-black/10">
          <SheetTitle>{product?.name ?? "Détail du produit"}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 p-4">
          {isLoading && (
            <div className="flex flex-col gap-4">
              <Skeleton className="aspect-[4/3] w-full rounded-lg" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}
          {error && <p className="text-body text-sangria">{error}</p>}

          {product && !isLoading && (
            <>
              <ImageGallery productName={product.name} images={product.images} />

              <div className="flex flex-col gap-3 rounded-lg bg-cream/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-h1 font-semibold text-ink">{formatPrice(product.price)}</span>
                    {product.compareAtPrice && (
                      <span className="text-body text-ink/40 line-through">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-small font-medium",
                      product.active ? "bg-delivered-light text-delivered" : "bg-ink/5 text-ink/60"
                    )}
                  >
                    {product.active ? "Actif" : "Inactif"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-background px-3 py-1 text-small font-medium text-ink/70 ring-1 ring-black/5">
                    {product.category}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-small font-medium ring-1 ring-black/5",
                      product.stock === 0
                        ? "bg-sangria/10 text-sangria"
                        : "bg-background text-ink/70"
                    )}
                  >
                    Stock total {product.stock}
                  </span>
                  {product.reviewCount > 0 && (
                    <ReviewStars rating={product.averageRating ?? 0} reviewCount={product.reviewCount} />
                  )}
                </div>
              </div>

              {product.description && (
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-small font-medium tracking-wide text-ink/50 uppercase">Description</h3>
                  <p className="text-body leading-relaxed text-ink/80">{product.description}</p>
                </div>
              )}

              {product.variants.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-3">
                    <h3 className="text-small font-medium tracking-wide text-ink/50 uppercase">
                      Couleurs & tailles
                    </h3>
                    <div className="flex flex-col gap-2">
                      {product.variants.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between rounded-md border border-black/5 bg-cream/40 px-3 py-2"
                        >
                          <span className="flex items-center gap-2 text-body text-ink">
                            <span
                              className="size-4 shrink-0 rounded-full border border-black/10"
                              style={{ backgroundColor: v.colorHex }}
                            />
                            {v.colorName ?? v.colorHex}
                            {v.size && (
                              <span className="rounded-sm border border-black/10 px-1.5 py-px text-small text-ink/60">
                                {v.size}
                              </span>
                            )}
                            {!v.active && <span className="text-small text-ink/40">(inactive)</span>}
                          </span>
                          <span
                            className={cn(
                              "text-small font-medium",
                              v.stock === 0 ? "text-sangria" : "text-ink/60"
                            )}
                          >
                            Stock {v.stock}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
