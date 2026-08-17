import Link from "next/link"
import { ImagePlaceholder } from "./ImagePlaceholder"
import { PriceTag } from "./PriceTag"
import { resolveMediaUrl } from "@/lib/utils"
import type { Product } from "@/types"

/** Narrow, fixed-width product card for horizontally-scrollable single-row lists (mobile). */
export function ProductCardCompact({ product }: { product: Product }) {
  const thumbnail = product.images[0]?.url

  return (
    <Link
      href={`/products/${product.id}`}
      className="flex w-32 shrink-0 flex-col gap-1.5 rounded-md p-1 transition-colors hover:bg-gold-light/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sangria sm:w-36"
    >
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolveMediaUrl(thumbnail)}
          alt={product.name}
          className="aspect-[4/3] w-full rounded-md object-cover"
        />
      ) : (
        <ImagePlaceholder aspectRatio="4-3" label="" />
      )}
      <span className="line-clamp-1 text-small font-medium text-ink">{product.name}</span>
      <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} className="text-small" />
    </Link>
  )
}
