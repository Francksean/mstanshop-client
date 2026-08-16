"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useTranslations } from "next-intl"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/useAuthStore"
import { useAuth } from "@/hooks/useAuth"

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("account")
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { logout } = useAuth()

  const tabs = [
    { href: "/account/profile", label: t("nav.profile") },
    { href: "/account/orders", label: t("nav.orders") },
  ]

  useEffect(() => {
    if (!user) {
      router.replace("/login")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <h1 className="mb-6 text-h1 text-ink">{t("title")}</h1>
      <nav
        aria-label={t("navAria")}
        className="mb-8 flex flex-col gap-3 border-b border-black/10 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
      >
        <div className="flex gap-6 overflow-x-auto [scrollbar-width:none] sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative shrink-0 pb-3 text-body transition-colors",
                  isActive ? "font-medium text-ink" : "text-ink/50 hover:text-ink"
                )}
              >
                {tab.label}
                {isActive && <span className="absolute -bottom-px left-0 h-0.5 w-full bg-sangria" />}
              </Link>
            )
          })}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="self-start text-sangria hover:text-sangria sm:mb-3 sm:self-auto"
          onClick={() => logout()}
        >
          <LogOut className="size-4" />
          {t("logout")}
        </Button>
      </nav>
      {children}
    </div>
  )
}
