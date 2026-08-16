import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"

export default async function NotFound() {
  const t = await getTranslations("errors")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-4 text-center">
      <h1 className="text-h1 text-ink">{t("notFoundTitle")}</h1>
      <p className="max-w-md text-body text-ink/60">{t("notFoundDescription")}</p>
      <Button asChild className="mt-2">
        <Link href="/">{t("backHome")}</Link>
      </Button>
    </div>
  )
}
