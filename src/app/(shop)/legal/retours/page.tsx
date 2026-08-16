import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.retours")
  return { title: t("metaTitle") }
}

export default async function RetoursPage() {
  const t = await getTranslations("legal")
  const tr = await getTranslations("legal.retours")

  return (
    <>
      <h1>{tr("title")}</h1>

      <h2>{tr("timeTitle")}</h2>
      <p>{tr("timeBody")}</p>

      <h2>{tr("conditionsTitle")}</h2>
      <p>{tr("conditionsBody")}</p>

      <h2>{tr("howTitle")}</h2>
      <ul>
        <li>{tr("howItem1")}</li>
        <li>{tr("howItem2")}</li>
        <li>{tr("howItem3")}</li>
      </ul>

      <h2>{tr("refundTitle")}</h2>
      <p>{tr("refundBody")}</p>

      <p className="mt-8 text-small! text-ink/40!">{t("disclaimer")}</p>
    </>
  )
}
