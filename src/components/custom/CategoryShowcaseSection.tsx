"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { ProductGrid } from "./ProductGrid"
import { resolveMediaUrl } from "@/lib/utils"
import type { Category, Product } from "@/types"

interface CategoryShowcaseSectionProps {
  category: Category
  products: Product[]
}

export function CategoryShowcaseSection({ category, products }: CategoryShowcaseSectionProps) {
  const t = useTranslations("home")

  return (
    <section className="flex flex-col gap-6">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        {category.bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveMediaUrl(category.bannerUrl)}
            alt=""
            className="mb-6 aspect-[16/5] w-full rounded-md object-cover"
          />
        )}
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-heading text-h1 text-ink">{category.name}</h2>
        </div>
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
