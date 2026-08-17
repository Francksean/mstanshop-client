"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface ImagePlaceholderProps {
  label?: string
  aspectRatio?: "square" | "portrait" | "wide" | "4-3"
  className?: string
}

const ASPECT_CLASSES: Record<NonNullable<ImagePlaceholderProps["aspectRatio"]>, string> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[16/9]",
  "4-3": "aspect-[4/3]",
}

export function ImagePlaceholder({
  label,
  aspectRatio = "portrait",
  className,
}: ImagePlaceholderProps) {
  const t = useTranslations("common")
  const resolvedLabel = label ?? t("imagePlaceholder")

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-md border border-gold/25 bg-gradient-to-br from-cream via-gold-light/40 to-cream",
        ASPECT_CLASSES[aspectRatio],
        className
      )}
      role="img"
      aria-label={resolvedLabel}
    >
      <span
        className="pointer-events-none select-none font-serif text-6xl italic text-gold/25"
        aria-hidden="true"
      >
        M
      </span>
    </div>
  )
}
