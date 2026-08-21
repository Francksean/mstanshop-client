"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ImagePlaceholder } from "./ImagePlaceholder"
import { cn, resolveMediaUrl } from "@/lib/utils"
import type { ProductImage } from "@/types"

interface ImageGalleryProps {
  productName: string
  images?: ProductImage[]
}

export function ImageGallery({ productName, images = [] }: ImageGalleryProps) {
  const t = useTranslations("products.gallery")
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex(0)
  }, [images])

  if (images.length === 0) {
    const placeholders = [0, 1, 2]
    return (
      <div className="flex flex-col gap-4">
        <div className="overflow-hidden rounded-md">
          <div className="transition-transform duration-300 hover:scale-105">
            <ImagePlaceholder aspectRatio="square" label={t("zoomLabel", { productName })} />
          </div>
        </div>
        <div className="flex gap-3">
          {placeholders.map((i) => (
            <ImagePlaceholder key={i} aspectRatio="square" label="" className="h-20 w-20 shrink-0 rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  const active = images[Math.min(activeIndex, images.length - 1)]
  const hasMultiple = images.length > 1

  function goTo(index: number) {
    setActiveIndex((index + images.length) % images.length)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="group relative overflow-hidden rounded-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveMediaUrl(active.url)}
          alt={productName}
          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              aria-label={t("previous")}
              className="absolute top-1/2 left-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-ink opacity-0 shadow-sm transition-opacity focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sangria group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              aria-label={t("next")}
              className="absolute top-1/2 right-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-ink opacity-0 shadow-sm transition-opacity focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sangria group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((image, i) => (
                <span
                  key={image.id}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    i === activeIndex ? "bg-sangria" : "bg-background/70"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {hasMultiple && (
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible md:flex-wrap">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={t("viewImage", { number: i + 1 })}
              aria-current={activeIndex === i}
              className={cn(
                "h-20 w-20 shrink-0 overflow-hidden rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sangria",
                activeIndex === i ? "border-sangria" : "border-black/10"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveMediaUrl(image.url)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
