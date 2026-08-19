import { ProductCard } from "./ProductCard"
import { ProductCardShimmer } from "./ProductCardShimmer"
import type { Product } from "@/types"
import { cn } from "@/lib/utils"

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
  skeletonCount?: number
  columns?: "2-4" | "2-3-4" | "2-3" | "2"
  /** Renders a single horizontally-scrollable row on mobile, reverting to the normal grid at md+. */
  scrollOnMobile?: boolean
}

export function ProductGrid({
  products,
  isLoading = false,
  skeletonCount = 8,
  columns = "2-3",
  scrollOnMobile = false,
}: ProductGridProps) {
  const gridClass =
    columns === "2"
      ? "grid-cols-2"
      : columns === "2-4"
        ? "grid-cols-2 md:grid-cols-4"
        : columns === "2-3"
          ? "grid-cols-2 md:grid-cols-3"
          : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  const gapClass = columns === "2" ? "gap-4" : "gap-4 md:gap-8"

  const containerClass = scrollOnMobile
    ? cn(
        "flex snap-x snap-mandatory overflow-x-auto pb-1 px-4 md:px-0 md:grid md:overflow-visible md:pb-0",
        gapClass,
        gridClass
      )
    : cn("grid", gapClass, gridClass)

  const itemClass = scrollOnMobile ? "w-40 shrink-0 snap-start sm:w-48 md:w-auto md:shrink" : undefined

  if (isLoading) {
    return (
      <div className={containerClass}>
        {Array.from({ length: skeletonCount }).map((_, i) =>
          itemClass ? (
            <div key={i} className={itemClass}>
              <ProductCardShimmer />
            </div>
          ) : (
            <ProductCardShimmer key={i} />
          )
        )}
      </div>
    )
  }

  return (
    <div className={containerClass}>
      {products.map((product) =>
        itemClass ? (
          <div key={product.id} className={itemClass}>
            <ProductCard product={product} />
          </div>
        ) : (
          <ProductCard key={product.id} product={product} />
        )
      )}
    </div>
  )
}
