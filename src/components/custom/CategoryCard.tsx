import Link from "next/link"
import { ImagePlaceholder } from "./ImagePlaceholder"
import { resolveMediaUrl } from "@/lib/utils"
import type { Category } from "@/types"

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group relative flex flex-col gap-3 rounded-md p-2 transition-colors hover:bg-gold-light/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sangria"
    >
      <div className="relative">
        {category.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveMediaUrl(category.thumbnailUrl)}
            alt={category.name}
            className="aspect-square w-full rounded-md object-cover transition-colors group-hover:brightness-95"
          />
        ) : (
          <ImagePlaceholder aspectRatio="square" label={category.name} className="group-hover:bg-sangria/5" />
        )}
        {category.promoActive && (
          <span className="absolute top-2 right-2 rounded-full bg-sangria px-2 py-0.5 text-small font-medium text-white">
            -{category.promoDiscountValue}
            {category.promoDiscountType === "PERCENTAGE" ? "%" : " XAF"}
          </span>
        )}
      </div>
      <span className="text-body font-medium text-ink">{category.name}</span>
    </Link>
  )
}
