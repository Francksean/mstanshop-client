"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldError } from "@/components/ui/field"
import { cn } from "@/lib/utils"
import { createReview } from "@/lib/services/reviews.service"
import { normalizeError } from "@/lib/api-error"
import type { Review } from "@/types"

interface ReviewFormProps {
  productId: string
  onSubmitted: (review: Review) => void
}

export function ReviewForm({ productId, onSubmitted }: ReviewFormProps) {
  const t = useTranslations("products.reviews")
  const tApiErrors = useTranslations("apiErrors")

  const reviewSchema = z.object({
    rating: z.number().min(1, t("ratingRequired")).max(5),
    comment: z.string().max(2000, t("commentMaxLength")).optional(),
  })
  type ReviewFormValues = z.infer<typeof reviewSchema>

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const { control, handleSubmit, reset } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  })

  async function onSubmit(values: ReviewFormValues) {
    setIsSubmitting(true)
    try {
      const review = await createReview(productId, {
        rating: values.rating,
        comment: values.comment || undefined,
      })
      toast.success(t("thankYou"))
      reset({ rating: 0, comment: "" })
      onSubmitted(review)
    } catch (error) {
      toast.error(normalizeError(error, tApiErrors).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 rounded-md border border-black/5 bg-cream/50 p-5"
    >
      <span className="text-small font-medium tracking-wide text-ink/60 uppercase">{t("leaveReview")}</span>

      <Controller
        name="rating"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <div
              className="flex items-center gap-0.5"
              role="radiogroup"
              aria-label={t("ratingLabel")}
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={field.value === i}
                  aria-label={t("starAria", { count: i })}
                  onClick={() => field.onChange(i)}
                  onMouseEnter={() => setHoverRating(i)}
                  className="rounded-sm p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sangria"
                >
                  <Star
                    strokeWidth={1.5}
                    className={cn(
                      "size-7 transition-colors",
                      i <= (hoverRating || field.value) ? "fill-gold text-gold" : "fill-transparent text-ink/20"
                    )}
                  />
                </button>
              ))}
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="comment"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <Textarea
              {...field}
              placeholder={t("commentPlaceholder")}
              className="bg-background"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </div>
    </form>
  )
}
