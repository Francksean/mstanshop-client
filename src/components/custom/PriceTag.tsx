import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/utils"

interface PriceTagProps {
  price: number
  compareAtPrice?: number
  size?: "default" | "lg"
  className?: string
}

export function PriceTag({ price, compareAtPrice, size = "default", className }: PriceTagProps) {
  const hasDiscount = Boolean(compareAtPrice && compareAtPrice > price)
  const discountPercent = hasDiscount ? Math.round((1 - price / compareAtPrice!) * 100) : 0

  return (
    <span className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-mono font-semibold tabular-nums text-ink",
          size === "lg" ? "text-h1" : "text-body"
        )}
      >
        {formatPrice(price)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-small text-ink/40 line-through">{formatPrice(compareAtPrice!)}</span>
          <span className="rounded-full bg-sangria/10 px-1.5 py-0.5 text-small font-medium text-sangria">
            -{discountPercent}%
          </span>
        </>
      )}
    </span>
  )
}
