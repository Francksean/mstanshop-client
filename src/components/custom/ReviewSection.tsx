"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { ReviewStars } from "./ReviewStars"
import { ReviewList } from "./ReviewList"
import { ReviewForm } from "./ReviewForm"
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog"
import { getReviews } from "@/lib/services/reviews.service"
import { deleteReview } from "@/lib/services/admin/reviews.service"
import { useAuthStore } from "@/stores/useAuthStore"
import { normalizeError } from "@/lib/api-error"
import type { Review } from "@/types"

interface ReviewSectionProps {
  productId: string
  averageRating: number | null
  reviewCount: number
}

export function ReviewSection({ productId, averageRating, reviewCount }: ReviewSectionProps) {
  const t = useTranslations("products.reviews")
  const tApiErrors = useTranslations("apiErrors")
  const tCommon = useTranslations("common.actions")
  const isAuthenticated = useAuthStore((s) => Boolean(s.user))
  const [reviews, setReviews] = useState<Review[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true)
    getReviews(productId, { page: 0, size: 5 })
      .then((data) => {
        if (cancelled) return
        setReviews(data.content)
        setPage(data.page)
        setTotalPages(data.totalPages)
      })
      .catch((err) => {
        if (!cancelled) toast.error(normalizeError(err, tApiErrors).message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  async function loadMore() {
    setIsLoading(true)
    try {
      const data = await getReviews(productId, { page: page + 1, size: 5 })
      setReviews((prev) => [...prev, ...data.content])
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch (err) {
      toast.error(normalizeError(err, tApiErrors).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="mx-auto mt-16 max-w-3xl border-t border-black/10 pt-10">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-h2 text-ink">{t("title")}</h2>
        {reviewCount > 0 && <ReviewStars rating={averageRating ?? 0} reviewCount={reviewCount} size="md" />}
      </div>

      <div className="mt-6">
        {isAuthenticated ? (
          <ReviewForm
            productId={productId}
            onSubmitted={(review) => {
              setReviews((prev) => [review, ...prev])
            }}
          />
        ) : (
          <p className="rounded-md border border-black/5 bg-cream/50 p-4 text-body text-ink/60">
            <Link href="/login" className="font-medium text-sangria underline-offset-4 hover:underline">
              {t("loginPromptLink")}
            </Link>{" "}
            {t("loginPromptSuffix")}
          </p>
        )}
      </div>

      <div className="mt-8">
        <ReviewList reviews={reviews} onDelete={(id) => setDeletingId(id)} />
      </div>

      {page + 1 < totalPages && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={isLoading}>
            {isLoading ? tCommon("loading") : t("seeMore")}
          </Button>
        </div>
      )}

      <DeleteConfirmDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title={t("deleteTitle")}
        description={t("deleteDescription")}
        cancelLabel={tCommon("cancel")}
        onConfirm={async () => {
          if (!deletingId) return
          await deleteReview(deletingId)
          setReviews((prev) => prev.filter((r) => r.id !== deletingId))
        }}
      />
    </section>
  )
}
