"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { Check, Globe, LogOut, Menu, Package, ShoppingBag, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchBar } from "@/components/custom/SearchBar"
import { useCategories } from "@/hooks/useCategories"
import { useCart } from "@/hooks/useCart"
import { useAuth } from "@/hooks/useAuth"
import { useUiStore } from "@/stores/useUiStore"
import { cn } from "@/lib/utils"
import { LOCALE_COOKIE, type Locale } from "@/i18n/config"

const ALL_CATEGORIES = "ALL"
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function Header() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations("header")
  const { categories } = useCategories()
  const { count, openDrawer } = useCart()
  const { user, logout } = useAuth()
  const openMobileNav = useUiStore((s) => s.openMobileNav)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState(ALL_CATEGORIES)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set("search", query.trim())
    if (category !== ALL_CATEGORIES) params.set("category", category)
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`)
  }

  function setLocale(next: Locale) {
    if (next === locale) return
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}`
    router.refresh()
  }

  const searchBarProps = {
    value: query,
    onChange: setQuery,
    onSubmit: handleSearch,
    placeholder: t("searchPlaceholder"),
    searchAriaLabel: t("searchLabel"),
    submitLabel: t("search"),
    categories,
    category,
    onCategoryChange: setCategory,
    allCategoriesValue: ALL_CATEGORIES,
    allCategoriesLabel: t("allCategories"),
    categoryPlaceholder: t("categoryPlaceholder"),
    categoryAriaLabel: t("categoryFilter"),
  }

  return (
    <header
      className={cn(
        "border-b bg-background/95 backdrop-blur transition-colors duration-300",
        scrolled ? "border-gold/30 shadow-sm" : "border-black/10"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 md:gap-3 md:px-8">
        <Button variant="ghost" size="icon" aria-label={t("openMenu")} onClick={openMobileNav}>
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/" aria-label="MSTANSHOP" className="flex shrink-0 items-center gap-2">
          <Image src="/logo.png" alt="" width={32} height={32} className="size-8" priority />
          <span className="hidden font-heading text-lg font-semibold tracking-tight text-ink sm:inline sm:text-h2">
            MSTANSHOP
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 md:flex">
          <SearchBar {...searchBarProps} />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1 md:ml-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" aria-label={t("chooseLanguage")} className="gap-1.5 px-1.5 sm:px-2">
                <Globe className="h-5 w-5" />
                <span className="hidden sm:inline">{locale.toUpperCase()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-ink">{t("language")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setLocale("fr")}>
                {t("french")}
                {locale === "fr" && <Check className="ml-auto size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLocale("en")}>
                {t("english")}
                {locale === "en" && <Check className="ml-auto size-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" aria-label={t("myAccount")} className="gap-1.5 px-1.5 sm:px-2">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">{t("myAccount")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-ink">
                  {user.firstName} {user.lastName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account/profile">
                    <User className="size-4" />
                    {t("myProfile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/orders">
                    <Package className="size-4" />
                    {t("myOrders")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => logout()}>
                  <LogOut className="size-4" />
                  {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" aria-label={t("login")} className="gap-1.5 px-1.5 sm:px-2" asChild>
              <Link href="/login">
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">{t("myAccount")}</span>
              </Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            aria-label={t("cart", { count })}
            onClick={openDrawer}
            className="relative"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sangria text-[10px] font-medium text-white">
                {count}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="border-t border-black/10 px-4 pt-3 pb-3 md:hidden">
        <SearchBar {...searchBarProps} />
      </div>
    </header>
  )
}
