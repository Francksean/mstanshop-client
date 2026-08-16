import { ProductGrid } from "@/components/custom/ProductGrid"

export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-[220px_1fr]">
        <div className="hidden md:block" />
        <ProductGrid products={[]} isLoading skeletonCount={8} />
      </div>
    </div>
  )
}
