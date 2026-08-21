"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

const COOKIE_CONSENT_KEY = "mstan_cookie_consent"

export function CookieConsentBanner() {
  const t = useTranslations("cookieConsent")
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(!window.localStorage.getItem(COOKIE_CONSENT_KEY))
  }, [])

  function respond(value: "accepted" | "rejected") {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-background/95 p-4 shadow-lg backdrop-blur supports-backdrop-filter:bg-background/80 md:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-body font-medium text-ink">{t("title")}</p>
          <p className="text-small text-ink/70">
            {t("description")}{" "}
            <Link href="/legal/confidentialite" className="underline decoration-gold underline-offset-4 text-sangria">
              {t("learnMore")}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" onClick={() => respond("rejected")}>
            {t("reject")}
          </Button>
          <Button onClick={() => respond("accepted")}>{t("acceptAll")}</Button>
        </div>
      </div>
    </div>
  )
}
