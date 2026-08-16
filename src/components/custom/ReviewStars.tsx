import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReviewStarsProps {
  rating: number
  reviewCount?: number
  size?: "sm" | "md" | "lg"
  className?: string
}

const STAR_SIZE: Record<NonNullable<ReviewStarsProps["size"]>, string> = {
  sm: "size-3",
  md: "size-4",
  lg: "size-6",
}

export function ReviewStars({ rating, reviewCount, size = "sm", className }: ReviewStarsProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-px" role="img" aria-label={`${rating.toFixed(1)} sur 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            strokeWidth={1.5}
            className={cn(
              STAR_SIZE[size],
              "transition-colors",
              i <= Math.round(rating) ? "fill-gold text-gold" : "fill-transparent text-ink/15"
            )}
          />
        ))}
      </div>
      {reviewCount !== undefined && (
        <span className="text-small text-ink/50">
          {rating > 0 ? rating.toFixed(1) : ""} ({reviewCount})
        </span>
      )}
    </div>
  )
}
