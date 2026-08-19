"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function Hero() {
  const t = useTranslations("home");
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative w-full overflow-hidden bg-cream">
      <motion.div
        className="relative h-[75vh] w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Hero banner background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero_banner.jpg"
          alt={t("heroImageLabel")}
          className="h-full w-full object-cover"
        />

        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />

        {/* Quote image - positioned bottom right */}
        <motion.img
          src="/mstan_quote.png"
          alt=""
          className="absolute bottom-8 right-8 md:bottom-0 md:right-[10vw] h-40 w-40 md:h-56 md:w-56 object-contain md:-translate-y-12 md:translate-x-16"
          style={{ rotate: "12deg" }}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        />

        {/* Text overlay - anchored to bottom */}
        <div className="absolute inset-0 flex flex-col justify-end px-4 py-8 md:px-8 md:py-16">
          <motion.div
            className="max-w-2xl"
            initial="hidden"
            animate="show"
            transition={{
              duration: 0.6,
              staggerChildren: 0.1,
              delayChildren: 0.2,
            }}
          >
            {/* Collection label */}
            <motion.span
              variants={{
                hidden: { opacity: 0, y: reduceMotion ? 0 : 12 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5 }}
              className="block font-serif text-small italic text-gold/90 uppercase tracking-wide mb-2"
            >
              {t("collectionLabel")}
            </motion.span>

            {/* Main season/title */}
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: reduceMotion ? 0 : 24 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6 }}
              className="font-heading text-4xl md:text-6xl font-semibold text-cream leading-[1.1] mb-6"
            >
              {t("heroTitle")}
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={{
                hidden: { opacity: 0, y: reduceMotion ? 0 : 12 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5 }}
              className="max-w-md text-body text-cream/80 mb-6"
            >
              {t("heroBody")}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: reduceMotion ? 0 : 12 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Button
                asChild
                size="lg"
                className="bg-gold text-ink hover:bg-gold/90"
              >
                <Link href="/products">{t("discoverCollection")}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-sangria text-cream hover:bg-sangria/90"
              >
                <Link href="/products">{t("visitShop")}</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Gold accent line - full width below banner */}
      <motion.div
        className="h-1 w-full bg-gradient-to-r from-gold via-gold to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{ transformOrigin: "left" }}
      />
    </section>
  );
}
