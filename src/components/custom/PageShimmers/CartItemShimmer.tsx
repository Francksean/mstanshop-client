import { Skeleton } from "@/components/ui/skeleton"

export function CartItemShimmer() {
  return (
    <div className="flex items-center gap-4 py-6">
      <Skeleton className="h-20 w-20 shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-4 w-12" />
    </div>
  )
}
