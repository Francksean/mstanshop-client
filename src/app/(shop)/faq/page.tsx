import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("faq")
  return {
    title: `${t("title")} — MSTANSHOP`,
    description: t("metaDescription"),
  }
}

const SECTION_KEYS = ["orderPayment", "shipping", "returns"] as const
const SECTION_ITEM_KEYS: Record<(typeof SECTION_KEYS)[number], string[]> = {
  orderPayment: ["howToPay", "cancelOrder", "promoNotWorking"],
  shipping: ["deliveryTime", "trackOrder", "shipAbroad"],
  returns: ["canReturn", "howRefund"],
}

export default async function FaqPage() {
  const t = await getTranslations("faq")

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8">
      <span className="flex items-center gap-2 text-small font-medium tracking-[0.2em] text-gold uppercase">
        {t("eyebrow")}
      </span>
      <h1 className="mt-3 mb-10 font-heading text-display text-ink">{t("title")}</h1>

      <div className="flex flex-col gap-10">
        {SECTION_KEYS.map((section) => (
          <div key={section}>
            <h2 className="mb-3 font-heading text-h2 text-ink">{t(`sections.${section}.title`)}</h2>
            <Accordion type="single" collapsible>
              {SECTION_ITEM_KEYS[section].map((item) => (
                <AccordionItem key={item} value={`${section}-${item}`}>
                  <AccordionTrigger className="text-body font-medium">
                    {t(`sections.${section}.items.${item}.question`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-body text-ink/70">
                    {t(`sections.${section}.items.${item}.answer`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  )
}
