"use client"

import { useFormatter, useTranslations } from "next-intl"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ReviewStars } from "./ReviewStars"
import { useAuthStore } from "@/stores/useAuthStore"
import type { Review } from "@/types"

interface ReviewListProps {
  reviews: Review[]
  onDelete?: (id: string) => void
}

export function ReviewList({ reviews, onDelete }: ReviewListProps) {
  const t = useTranslations("products.reviews")
  const format = useFormatter()
  const isAdmin = useAuthStore((s) => s.isAdmin)

  if (reviews.length === 0) {
    return <p className="text-body text-ink/50">{t("noReviews")}</p>
  }

  return (
    <div className="flex flex-col gap-5">
      {reviews.map((review) => (
        <div key={review.id} className="flex gap-3 rounded-md border border-black/5 bg-cream/50 p-4">
          <Avatar className="size-9 shrink-0">
            <AvatarFallback className="bg-gold-light text-small font-medium text-ink">
              {review.userFirstName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-body font-medium text-ink">{review.userFirstName}</span>
                <ReviewStars rating={review.rating} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-small text-ink/40">
                  {format.dateTime(new Date(review.createdAt), { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                {isAdmin && onDelete && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={t("deleteAria")}
                    onClick={() => onDelete(review.id)}
                  >
                    <Trash2 className="size-3.5 text-sangria" />
                  </Button>
                )}
              </div>
            </div>
            {review.comment && <p className="text-body text-ink/70">{review.comment}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
