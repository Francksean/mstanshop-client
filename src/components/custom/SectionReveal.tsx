"use client"

import { motion, useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"

/** Subtle fade/rise-in when a homepage section enters the viewport. */
export function SectionReveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}
