"use client"

import { Toaster } from "@/components/ui/sonner"
import { CookieConsentBanner } from "@/components/custom/CookieConsentBanner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="bottom-right" />
      <CookieConsentBanner />
    </>
  )
}
