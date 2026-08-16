"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface Rule {
  key: string
  test: (password: string) => boolean
}

const RULES: Rule[] = [
  { key: "minLength", test: (p) => p.length >= 8 },
  { key: "uppercase", test: (p) => /[A-Z]/.test(p) },
  { key: "lowercase", test: (p) => /[a-z]/.test(p) },
  { key: "digit", test: (p) => /\d/.test(p) },
  { key: "special", test: (p) => /[@$!%*?&#^()_+=-]/.test(p) },
]

export function PasswordStrengthMeter({ password }: { password: string }) {
  const t = useTranslations("auth.passwordRules")
  const passedCount = RULES.filter((rule) => rule.test(password)).length
  const ratio = passedCount / RULES.length
  const barColor = ratio >= 1 ? "bg-delivered" : ratio >= 0.6 ? "bg-gold" : "bg-sangria"

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {RULES.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < passedCount ? barColor : "bg-black/10"
            )}
          />
        ))}
      </div>
      <ul className="flex flex-col gap-0.5 text-small text-ink/60">
        {RULES.map((rule) => (
          <li key={rule.key} className={cn(rule.test(password) && "text-ink")}>
            {rule.test(password) ? "✓" : "·"} {t(rule.key)}
          </li>
        ))}
      </ul>
    </div>
  )
}
