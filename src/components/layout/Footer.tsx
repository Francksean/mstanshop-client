"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { AtSign, Mail, Phone, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { CATEGORIES } from "@/lib/constants"
import { subscribeToNewsletter } from "@/lib/services/newsletter.service"
import { normalizeError } from "@/lib/api-error"

export function Footer() {
  const t = useTranslations("footer")
  const tApiErrors = useTranslations("apiErrors")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [thankYouOpen, setThankYouOpen] = useState(false)

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    const value = email.trim()
    if (!value || isSubmitting) return
    setIsSubmitting(true)
    try {
      await subscribeToNewsletter(value.includes("@") ? { email: value } : { phoneNumber: value })
      setEmail("")
      setThankYouOpen(true)
    } catch (error) {
      toast.error(normalizeError(error, tApiErrors).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="mt-24 bg-ink text-cream">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 md:grid-cols-[1.3fr_1fr_1fr_1fr] md:px-8">
        <div className="flex flex-col gap-4">
          <span className="font-heading text-h2 font-semibold">MSTANSHOP</span>
          <p className="text-body text-cream/70">{t("tagline")}</p>

          <form onSubmit={handleSubscribe} className="mt-2 flex flex-col gap-2">
            <span className="text-small font-medium tracking-wide text-gold uppercase">
              {t("stayInformed")}
            </span>
            <p className="text-body text-cream/70">{t("stayInformedBody")}</p>
            <div className="flex overflow-hidden rounded-md border border-cream/20 focus-within:border-gold">
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("newsletterPlaceholder")}
                aria-label={t("newsletterLabel")}
                disabled={isSubmitting}
                className="h-10 min-w-0 flex-1 bg-transparent px-3 text-body text-cream outline-none placeholder:text-cream/40 disabled:opacity-60"
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                aria-label={t("subscribe")}
                disabled={isSubmitting}
                className="h-10 w-10 rounded-none text-gold hover:bg-cream/10 hover:text-gold"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-small font-medium tracking-wide text-gold uppercase">{t("shop")}</span>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className="text-body text-cream/80 hover:text-gold"
            >
              {c.name}
            </Link>
          ))}
          <Link href="/products" className="text-body text-cream/80 hover:text-gold">
            {t("wholeCollection")}
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-small font-medium tracking-wide text-gold uppercase">{t("help")}</span>
          <Link href="/faq" className="text-body text-cream/80 hover:text-gold">
            {t("faq")}
          </Link>
          <Link href="/legal/retours" className="text-body text-cream/80 hover:text-gold">
            {t("shippingReturns")}
          </Link>
          <Link href="/account/orders" className="text-body text-cream/80 hover:text-gold">
            {t("trackOrder")}
          </Link>
          <a
            href="mailto:contact@mstanshop.com"
            className="flex items-center gap-2 text-body text-cream/80 hover:text-gold"
          >
            <Mail className="h-4 w-4" /> contact@mstanshop.com
          </a>
          <a
            href="tel:+237650763576"
            className="flex items-center gap-2 text-body text-cream/80 hover:text-gold"
          >
            <Phone className="h-4 w-4" /> +237 650 763 576
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-small font-medium tracking-wide text-gold uppercase">{t("legal")}</span>
          <Link href="/legal/mentions-legales" className="text-body text-cream/80 hover:text-gold">
            {t("legalNotice")}
          </Link>
          <Link href="/legal/cgv" className="text-body text-cream/80 hover:text-gold">
            {t("termsOfSale")}
          </Link>
          <Link href="/legal/confidentialite" className="text-body text-cream/80 hover:text-gold">
            {t("privacyPolicy")}
          </Link>
          <Link href="/legal/retours" className="text-body text-cream/80 hover:text-gold">
            {t("returnPolicy")}
          </Link>

          <span className="mt-2 text-small font-medium tracking-wide text-gold uppercase">
            {t("followUs")}
          </span>
          <a
            href="https://instagram.com/mstanshops"
            className="flex items-center gap-2 text-body text-cream/80 hover:text-gold"
          >
            <AtSign className="h-4 w-4" /> mstanshops
          </a>
          <a
            href="https://facebook.com"
            className="flex items-center gap-2 text-body text-cream/80 hover:text-gold"
          >
            <AtSign className="h-4 w-4" /> Facebook
          </a>
        </div>
      </div>

      <div className="border-t border-cream/10 px-4 py-6 text-center text-small text-cream/50 md:px-8">
        {t("copyright", { year: new Date().getFullYear() })}
      </div>

      <Dialog open={thankYouOpen} onOpenChange={setThankYouOpen}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="font-heading text-h2">{t("subscribedTitle")}</DialogTitle>
            <DialogDescription>{t("subscribed")}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </footer>
  )
}
