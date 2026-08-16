"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export function AuthTabs() {
  const t = useTranslations("auth.tabs")
  const pathname = usePathname()

  const tabs = [
    { href: "/login", label: t("login") },
    { href: "/register", label: t("register") },
  ]

  return (
    <div className="mb-8 flex gap-6 border-b border-black/10">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative pb-3 text-h2 transition-colors",
              isActive ? "text-ink" : "text-ink/40 hover:text-ink/70"
            )}
          >
            {tab.label}
            {isActive && <span className="absolute -bottom-px left-0 h-0.5 w-full bg-sangria" />}
          </Link>
        )
      })}
    </div>
  )
}
