import { Skeleton } from "@/components/ui/skeleton"

export function ProductCardShimmer({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={compact ? "flex w-32 shrink-0 flex-col gap-1.5 sm:w-36" : "flex flex-col gap-3"}>
      <Skeleton className="aspect-[4/3] w-full rounded-md" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  )
}
