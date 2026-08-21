"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { ProductGrid } from "./ProductGrid"
import { ImagePlaceholder } from "./ImagePlaceholder"
import { resolveMediaUrl } from "@/lib/utils"
import type { Category, Product } from "@/types"

interface CategoryShowcaseSectionProps {
  category: Category
  products: Product[]
}

export function CategoryShowcaseSection({ category, products }: CategoryShowcaseSectionProps) {
  const t = useTranslations("home")
  const imageUrl = category.bannerUrl ?? category.thumbnailUrl

  return (
    <section className="flex flex-col gap-6">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <Link
          href={`/products?category=${category.slug}`}
          className="group relative mb-8 block overflow-hidden rounded-md"
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveMediaUrl(imageUrl)}
              alt=""
              className="aspect-[16/6] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <ImagePlaceholder aspectRatio="wide" label={category.name} className="aspect-[16/6]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <h2 className="absolute bottom-6 left-6 font-heading text-h1 text-white drop-shadow-sm">
            {category.name}
          </h2>
        </Link>
      </div>
      <div className="px-4 md:mx-auto md:w-full md:max-w-7xl md:px-8">
        <ProductGrid products={products.slice(0, 5)} columns="2-3" scrollOnMobile />
      </div>
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <Link
          href={`/products?category=${category.slug}`}
          className="inline-block text-body font-medium text-sangria underline decoration-gold underline-offset-4"
        >
          {t("seeMore")}
        </Link>
      </div>
    </section>
  )
}
