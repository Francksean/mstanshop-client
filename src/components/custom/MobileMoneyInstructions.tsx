"use client"

import { useTranslations } from "next-intl"

export function MobileMoneyInstructions() {
  const t = useTranslations("checkout.payment.instructions")
  const steps = [t("step1"), t("step2"), t("step3"), t("step4"), t("step5"), t("step6")]

  return (
    <div className="rounded-md border-2 border-gold bg-gold-light/40 p-5">
      <h3 className="text-body font-semibold text-ink">{t("title")}</h3>
      <ol className="mt-4 flex flex-col gap-4">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sangria text-small font-semibold text-white">
              {i + 1}
            </span>
            <p className="text-small text-ink/80">{step}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
