import { ProductDetailShimmer } from "@/components/custom/PageShimmers/ProductDetailShimmer"

export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <ProductDetailShimmer />
    </div>
  )
}
