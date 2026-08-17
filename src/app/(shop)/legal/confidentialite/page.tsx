import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.confidentialite")
  return { title: t("metaTitle") }
}

export default async function ConfidentialitePage() {
  const tc = await getTranslations("legal.confidentialite")

  return (
    <>
      <h1>{tc("title")}</h1>

      <h2>{tc("collectedTitle")}</h2>
      <p>{tc("collectedBody")}</p>

      <h2>{tc("useTitle")}</h2>
      <ul>
        <li>{tc("useItem1")}</li>
        <li>{tc("useItem2")}</li>
        <li>{tc("useItem3")}</li>
      </ul>

      <h2>{tc("retentionTitle")}</h2>
      <p>{tc("retentionBody")}</p>

      <h2>{tc("rightsTitle")}</h2>
      <p>{tc("rightsBody")}</p>
    </>
  )
}
