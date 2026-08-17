"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { ProductGrid } from "./ProductGrid"
import { ProductCardCompact } from "./ProductCardCompact"
import { ProductCardShimmer } from "./ProductCardShimmer"
import { getFeaturedProducts } from "@/lib/services/products.service"
import type { Product } from "@/types"

interface SuggestedProductsProps {
  limit?: number
  title?: string
  compact?: boolean
  className?: string
}

export function SuggestedProducts({ limit = 4, title, compact = false, className }: SuggestedProductsProps) {
  const t = useTranslations("products")
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getFeaturedProducts(limit)
      .then((data) => {
        if (!cancelled) setProducts(data)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [limit])

  if (!isLoading && products.length === 0) return null

  return (
    <section className={className}>
      <h2 className={compact ? "mb-4 text-h2 text-ink" : "mb-8 text-h1 text-ink"}>{title ?? t("relatedTitle")}</h2>
      {compact ? (
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
          {isLoading
            ? Array.from({ length: limit }).map((_, i) => (
                <div key={i} className="snap-start">
                  <ProductCardShimmer compact />
                </div>
              ))
            : products.map((product) => (
                <div key={product.id} className="snap-start">
                  <ProductCardCompact product={product} />
                </div>
              ))}
        </div>
      ) : (
        <ProductGrid products={products} isLoading={isLoading} skeletonCount={limit} columns="2-4" />
      )}
    </section>
  )
}
