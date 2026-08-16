"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { ImagePlaceholder } from "./ImagePlaceholder"

export function Hero() {
  const t = useTranslations("home")
  const reduceMotion = useReducedMotion()

  const rise = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 16 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-12 md:grid-cols-[1fr_1.15fr] md:gap-16 md:px-8 md:py-24">
      <motion.div
        className="flex flex-col gap-6"
        initial="hidden"
        animate="show"
        transition={{ duration: 0.6, staggerChildren: 0.12 }}
      >
        <motion.span
          variants={rise}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 text-small font-medium tracking-[0.2em] text-gold uppercase"
        >
          {t("newCollection")}
        </motion.span>

        <motion.h1
          variants={rise}
          transition={{ duration: 0.6 }}
          className="font-heading text-display leading-[1.05] font-semibold text-ink"
        >
          {t("heroTitle")}
        </motion.h1>

        <motion.p variants={rise} transition={{ duration: 0.5 }} className="max-w-md text-body text-ink/70">
          {t("heroBody")}
        </motion.p>

        <motion.div variants={rise} transition={{ duration: 0.5 }} className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/products">{t("discoverCollection")}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/products">{t("visitShop")}</Link>
          </Button>
        </motion.div>

        <motion.div
          variants={rise}
          transition={{ duration: 0.5 }}
          className="h-px w-32 bg-gradient-to-r from-gold to-transparent"
        />
      </motion.div>

      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.15 }}
      >
        <ImagePlaceholder
          aspectRatio="wide"
          label={t("heroImageLabel")}
          className="md:aspect-[4/5]"
        />
        <div className="absolute -bottom-4 left-4 rounded-sm border border-gold/40 bg-cream px-4 py-2 shadow-sm md:left-8">
          <span className="block font-serif text-sm italic text-ink">{t("collectionLabel")}</span>
          <span className="block text-small tracking-widest text-gold uppercase">{t("season")}</span>
        </div>
      </motion.div>
    </section>
  )
}
