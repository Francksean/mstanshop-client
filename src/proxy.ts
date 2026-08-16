import { NextResponse, type NextRequest } from "next/server"
import { defaultLocale, isLocale, LOCALE_COOKIE, locales } from "@/i18n/config"

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function negotiateLocale(request: NextRequest) {
  const existing = request.cookies.get(LOCALE_COOKIE)?.value
  if (isLocale(existing)) return null

  const acceptLanguage = request.headers.get("accept-language") ?? ""
  const primaryTags = acceptLanguage.split(",").map((tag) => tag.trim().split(";")[0].split("-")[0].toLowerCase())
  const negotiated = primaryTags.find((tag) => (locales as readonly string[]).includes(tag))

  return isLocale(negotiated) ? negotiated : defaultLocale
}

export function proxy(request: NextRequest) {
  const negotiatedLocale = negotiateLocale(request)

  let response: NextResponse
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const role = request.cookies.get("mstan_role")?.value
    if (role !== "ROLE_ADMIN") {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("redirect", "/admin")
      url.searchParams.set("reason", "forbidden")
      response = NextResponse.redirect(url)
    } else {
      response = NextResponse.next()
    }
  } else {
    response = NextResponse.next()
  }

  if (negotiatedLocale) {
    response.cookies.set(LOCALE_COOKIE, negotiatedLocale, {
      path: "/",
      maxAge: LOCALE_COOKIE_MAX_AGE,
    })
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api|favicon.ico).*)"],
}
