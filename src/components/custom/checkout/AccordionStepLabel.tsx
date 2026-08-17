import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionStepLabelProps {
  n: number
  currentStep: number
  label: string
}

export function AccordionStepLabel({ n, currentStep, label }: AccordionStepLabelProps) {
  const isDone = n < currentStep
  const isActive = n === currentStep
  return (
    <span className="flex items-center gap-3">
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium",
          isDone && "border-sangria text-sangria",
          isActive && "border-sangria bg-sangria text-white",
          !isDone && !isActive && "border-black/20 text-ink/40"
        )}
      >
        {isDone ? <Check className="h-3.5 w-3.5" /> : n}
      </span>
      <span className={isActive ? "font-medium text-ink" : "text-ink/70"}>{label}</span>
    </span>
  )
}
