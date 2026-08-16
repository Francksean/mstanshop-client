"use client"

import { useTranslations } from "next-intl"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const FAQ_KEYS = [
  "sections.shipping.items.deliveryTime",
  "sections.orderPayment.items.howToPay",
  "sections.orderPayment.items.cancelOrder",
  "sections.shipping.items.trackOrder",
  "sections.returns.items.canReturn",
]

export function FaqSection() {
  const t = useTranslations("faq")

  return (
    <section className="mx-auto w-full max-w-3xl px-4 md:px-8">
      <h2 className="mb-8 font-heading text-h1 text-ink">{t("title")}</h2>
      <Accordion type="single" collapsible>
        {FAQ_KEYS.map((key) => (
          <AccordionItem key={key} value={key}>
            <AccordionTrigger className="text-lg font-medium">{t(`${key}.question`)}</AccordionTrigger>
            <AccordionContent className="text-lg text-ink/70">{t(`${key}.answer`)}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
