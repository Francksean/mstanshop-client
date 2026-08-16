import { cn } from "@/lib/utils"

/**
 * The "filet-lisière" — a nod to the selvage edge of a woven pagne cloth.
 * Used between homepage sections in place of plain whitespace.
 */
export function SectionDivider({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto flex w-full max-w-7xl items-center gap-3 px-4 md:px-8", className)} aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
    </div>
  )
}
