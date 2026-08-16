"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { ShieldCheck, MessageCircle, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrustBadge {
  icon: LucideIcon
  title: string
  subtitle: string
  href?: string
}

interface TrustBadgesProps {
  variant?: "band" | "inline"
  className?: string
}

export function TrustBadges({ variant = "band", className }: TrustBadgesProps) {
  const t = useTranslations("checkout.trustBadges")

  const badges: TrustBadge[] = [
    { icon: ShieldCheck, title: t("securePaymentTitle"), subtitle: t("securePaymentSubtitle") },
    { icon: MessageCircle, title: t("questionTitle"), subtitle: t("questionSubtitle") },
  ]

  const items = badges.map((badge) => {
    const content = (
      <>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sangria/10 text-sangria">
          <badge.icon className="size-5" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-body font-medium text-ink">{badge.title}</span>
          <span className="text-body text-ink/60">{badge.subtitle}</span>
        </span>
      </>
    )

    const key = `${badge.title}-${badge.subtitle}`

    return badge.href ? (
      <Link
        key={key}
        href={badge.href}
        className="flex items-center gap-3 rounded-md transition-colors hover:text-sangria focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sangria"
      >
        {content}
      </Link>
    ) : (
      <div key={key} className="flex items-center gap-3">
        {content}
      </div>
    )
  })

  if (variant === "band") {
    return (
      <div className={cn("w-full border-y border-gold/25 bg-cream py-8", className)}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-4 sm:flex-row sm:gap-16 md:px-8">
          {items}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-x-8 gap-y-4", className)}>{items}</div>
  )
}
