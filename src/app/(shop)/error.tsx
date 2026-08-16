"use client"

import { RetryFallback } from "@/components/custom/RetryFallback"

export default function ShopError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <RetryFallback onRetry={reset} />
    </div>
  )
}
