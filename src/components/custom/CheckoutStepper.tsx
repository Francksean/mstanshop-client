"use client"

import { Check } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export function CheckoutStepper({ currentStep, className }: { currentStep: number; className?: string }) {
  const t = useTranslations("checkout.stepper")
  const steps = [t("delivery"), t("shippingMethod"), t("paymentMethod"), t("confirmation")]

  return (
    <ol className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 text-small", className)}>
      {steps.map((label, index) => {
        const stepNumber = index + 1
        const isDone = stepNumber < currentStep
        const isActive = stepNumber === currentStep

        return (
          <li key={label} className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-medium",
                isDone && "border-sangria text-sangria",
                isActive && "border-sangria bg-sangria text-white",
                !isDone && !isActive && "border-black/20 text-ink/40"
              )}
            >
              {isDone ? <Check className="h-3.5 w-3.5" /> : stepNumber}
            </span>
            <span className={cn(isActive ? "font-medium text-ink" : "text-ink/50")}>{label}</span>
            {stepNumber < steps.length && (
              <span className={cn("mx-1 h-px w-8", isDone ? "bg-gold" : "bg-black/10")} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
