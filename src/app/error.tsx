"use client"

// This file replaces the entire root layout when a top-level error is thrown,
// so it renders above <NextIntlClientProvider> and can't use useTranslations()/useLocale().
// Keep a tiny local fallback dict instead of pulling in the full i18n pipeline here.
const STRINGS = {
  fr: {
    title: "Une erreur est survenue",
    body: "L'application a rencontré un problème inattendu. Vous pouvez réessayer.",
    retry: "Réessayer",
  },
  en: {
    title: "Something went wrong",
    body: "The application encountered an unexpected problem. You can try again.",
    retry: "Try again",
  },
} as const

function getLocaleFromCookie(): keyof typeof STRINGS {
  if (typeof document === "undefined") return "fr"
  const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=(fr|en)(?:;|$)/)
  return match?.[1] === "en" ? "en" : "fr"
}

export default function RootError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const locale = getLocaleFromCookie()
  const t = STRINGS[locale]

  return (
    <html lang={locale}>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FBF8F4] px-4 text-center">
          <h1 className="text-2xl font-bold text-[#2A211C]">{t.title}</h1>
          <p className="max-w-md text-[#2A211C]/60">{t.body}</p>
          <button
            onClick={reset}
            className="mt-2 rounded-md bg-[#8B0000] px-6 py-2 font-medium text-white"
          >
            {t.retry}
          </button>
        </div>
      </body>
    </html>
  )
}
