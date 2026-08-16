import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { ImagePlaceholder } from "@/components/custom/ImagePlaceholder"

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("home")

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="relative hidden flex-col justify-between p-10 md:flex">
        <ImagePlaceholder
          label={t("shopImageLabel")}
          aspectRatio="portrait"
          className="absolute inset-0 h-full w-full rounded-none"
        />
        <Link href="/" className="relative z-10 text-h2 font-bold tracking-tight text-ink">
          MSTANSHOP
        </Link>
        <p className="relative z-10 max-w-sm text-body text-ink/70">{t("heroBody")}</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-8 bg-cream px-4 py-16">
        <Link href="/" className="text-h2 font-bold tracking-tight text-ink md:hidden">
          MSTANSHOP
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
