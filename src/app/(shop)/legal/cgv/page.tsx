import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.cgv")
  return { title: t("metaTitle") }
}

export default async function CgvPage() {
  const t = await getTranslations("legal")
  const tCgv = await getTranslations("legal.cgv")

  return (
    <>
      <h1>{tCgv("title")}</h1>

      <h2>{tCgv("scopeTitle")}</h2>
      <p>{tCgv("scopeBody")}</p>

      <h2>{tCgv("orderTitle")}</h2>
      <p>{tCgv("orderBody")}</p>

      <h2>{tCgv("pricingTitle")}</h2>
      <p>{tCgv("pricingBody")}</p>

      <h2>{tCgv("deliveryTitle")}</h2>
      <p>
        {tCgv("deliveryBodyBefore")}{" "}
        <a href="/faq" className="text-sangria underline decoration-gold underline-offset-4">
          {t("linkFaq")}
        </a>
        {tCgv("deliveryBodyAfter")}
      </p>

      <h2>{tCgv("withdrawalTitle")}</h2>
      <p>
        {tCgv("withdrawalBodyBefore")}{" "}
        <a href="/legal/retours" className="text-sangria underline decoration-gold underline-offset-4">
          {t("linkReturnPolicy")}
        </a>
        {tCgv("withdrawalBodyAfter")}
      </p>

      <p className="mt-8 text-small! text-ink/40!">{t("disclaimer")}</p>
    </>
  )
}
