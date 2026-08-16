"use client"

import { useTranslations } from "next-intl"
import { ProductGrid } from "./ProductGrid"
import type { Product } from "@/types"

export function RelatedProducts({ products }: { products: Product[] }) {
  const t = useTranslations("products")

  if (products.length === 0) return null

  return (
    <section className="mt-16">
      <h2 className="mb-8 text-h1 text-ink">{t("relatedTitle")}</h2>
      <ProductGrid products={products} columns="2-4" />
    </section>
  )
}
