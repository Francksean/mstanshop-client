import { ProductCard } from "./ProductCard"
import { ProductCardShimmer } from "./ProductCardShimmer"
import type { Product } from "@/types"
import { cn } from "@/lib/utils"

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
  skeletonCount?: number
  columns?: "2-4" | "2-3-4" | "2-3" | "2"
}

export function ProductGrid({
  products,
  isLoading = false,
  skeletonCount = 8,
  columns = "2-3",
}: ProductGridProps) {
  const gridClass =
    columns === "2"
      ? "grid-cols-2"
      : columns === "2-4"
        ? "grid-cols-2 md:grid-cols-4"
        : columns === "2-3"
          ? "grid-cols-2 md:grid-cols-3"
          : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  const gapClass = columns === "2" ? "gap-4" : "gap-8"

  if (isLoading) {
    return (
      <div className={cn("grid", gapClass, gridClass)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardShimmer key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className={cn("grid", gapClass, gridClass)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
