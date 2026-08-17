"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { ShieldCheck, MessageCircle, BadgeCheck, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrustBadge {
  icon: LucideIcon
  title: string
  subtitle: string
  href?: string
}

interface TrustBadgesProps {
  variant?: "band" | "inline"
  /** "start" left-aligns the badge row instead of centering it. */
  align?: "center" | "start"
  className?: string
}

export function TrustBadges({ variant = "band", align = "center", className }: TrustBadgesProps) {
  const t = useTranslations("checkout.trustBadges")

  const badges: TrustBadge[] = [
    { icon: ShieldCheck, title: t("securePaymentTitle"), subtitle: t("securePaymentSubtitle") },
    { icon: BadgeCheck, title: t("authenticProductsTitle"), subtitle: t("authenticProductsSubtitle") },
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
    const itemClass = "flex items-center gap-3"

    return badge.href ? (
      <Link
        key={key}
        href={badge.href}
        className={cn(itemClass, "rounded-md transition-colors hover:text-sangria focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sangria")}
      >
        {content}
      </Link>
    ) : (
      <div key={key} className={itemClass}>
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
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-8 gap-y-4",
        align === "start" ? "justify-start" : "justify-center",
        className
      )}
    >
      {items}
    </div>
  )
}
