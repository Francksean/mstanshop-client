"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Header } from "@/components/layout/Header"
import { AnnouncementBar } from "@/components/custom/AnnouncementBar"
import { cn } from "@/lib/utils"

const SCROLL_THRESHOLD = 80
const DIRECTION_DELTA = 4

export function HeaderBar() {
  const t = useTranslations("header.announcements")
  const announcements = [t("back2school"), t("freeShipping"), t("newArrivals")]
  const barRef = useRef<HTMLDivElement>(null)
  const lastY = useRef(0)
  const [hidden, setHidden] = useState(false)
  const [spacerHeight, setSpacerHeight] = useState(0)

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    const observer = new ResizeObserver(() => setSpacerHeight(el.offsetHeight))
    observer.observe(el)
    setSpacerHeight(el.offsetHeight)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    lastY.current = window.scrollY
    function onScroll() {
      const y = window.scrollY
      const delta = y - lastY.current
      if (y < SCROLL_THRESHOLD) {
        setHidden(false)
      } else if (delta > DIRECTION_DELTA) {
        setHidden(true)
      } else if (delta < -DIRECTION_DELTA) {
        setHidden(false)
      }
      lastY.current = y
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <div
        ref={barRef}
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-transform duration-300 ease-in-out",
          hidden ? "-translate-y-full" : "translate-y-0"
        )}
      >
        <AnnouncementBar messages={announcements} />
        <Header />
      </div>
      <div style={{ height: spacerHeight }} />
    </>
  )
}
