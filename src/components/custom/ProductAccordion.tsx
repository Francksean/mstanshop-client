"use client"

import { useTranslations } from "next-intl"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { Product } from "@/types"

export function ProductAccordion({ product }: { product: Product }) {
  const t = useTranslations("products")

  return (
    <Accordion type="single" collapsible className="border-t border-black/10">
      <AccordionItem value="description">
        <AccordionTrigger className="text-body">{t("descriptionMaterials")}</AccordionTrigger>
        <AccordionContent className="text-body text-ink/70">
          <p>{product.description}</p>
          <p>{product.materials}</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="delivery">
        <AccordionTrigger className="text-body">{t("deliveryReturns")}</AccordionTrigger>
        <AccordionContent className="text-body text-ink/70">
          <p>{t("deliveryEstimate")}</p>
          <p>{product.careInstructions}</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
