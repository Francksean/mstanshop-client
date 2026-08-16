"use client"

import { useEffect, useState } from "react"
import { ProductGrid } from "./ProductGrid"
import { getFeaturedProducts } from "@/lib/services/products.service"
import type { Product } from "@/types"

interface SuggestedProductsProps {
  limit?: number
  title?: string
  compact?: boolean
  className?: string
}

export function SuggestedProducts({
  limit = 4,
  title = "Vous aimerez aussi",
  compact = false,
  className,
}: SuggestedProductsProps) {
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
      <h2 className={compact ? "mb-4 text-h2 text-ink" : "mb-8 text-h1 text-ink"}>{title}</h2>
      <ProductGrid
        products={products}
        isLoading={isLoading}
        skeletonCount={limit}
        columns={compact ? "2" : "2-4"}
      />
    </section>
  )
}
