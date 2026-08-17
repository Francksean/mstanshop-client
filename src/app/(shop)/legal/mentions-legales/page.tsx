import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.mentionsLegales")
  return { title: t("metaTitle") }
}

export default async function MentionsLegalesPage() {
  const t = await getTranslations("legal")
  const tm = await getTranslations("legal.mentionsLegales")

  return (
    <>
      <h1>{tm("title")}</h1>

      <h2>{tm("publisherTitle")}</h2>
      <p>{tm("publisherBody")}</p>

      <h2>{tm("hostingTitle")}</h2>
      <p>{tm("hostingBody")}</p>

      <h2>{tm("ipTitle")}</h2>
      <p>{tm("ipBody")}</p>

      <h2>{tm("dataTitle")}</h2>
      <p>
        {tm("dataBodyBefore")}{" "}
        <a href="/legal/confidentialite" className="text-sangria underline decoration-gold underline-offset-4">
          {t("linkPrivacyPolicy")}
        </a>
        {tm("dataBodyAfter")}
      </p>
    </>
  )
}
