import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  label: string
  value: string
  icon: LucideIcon
  accent?: "sangria" | "gold" | "delivered"
}

const ACCENT_CLASS: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  sangria: "bg-sangria/10 text-sangria",
  gold: "bg-gold-light text-ink",
  delivered: "bg-delivered-light text-delivered",
}

export function KpiCard({ label, value, icon: Icon, accent = "gold" }: KpiCardProps) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3">
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", ACCENT_CLASS[accent])}>
          <Icon className="size-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-small text-ink/60">{label}</span>
          <span className="text-body font-semibold text-ink">{value}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function KpiCardShimmer() {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}
