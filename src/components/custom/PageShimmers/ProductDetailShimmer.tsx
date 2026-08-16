import { Skeleton } from "@/components/ui/skeleton"

export function ProductDetailShimmer() {
  return (
    <div className="grid grid-cols-1 gap-12 py-8 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <Skeleton className="aspect-square w-full rounded-md" />
        <div className="flex gap-3">
          <Skeleton className="h-20 w-20 rounded-md" />
          <Skeleton className="h-20 w-20 rounded-md" />
          <Skeleton className="h-20 w-20 rounded-md" />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-6 w-1/5" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}
