"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

const SHOW_AFTER_SCROLL_Y = 400

export function ScrollToTopButton({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER_SCROLL_Y)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex size-11 items-center justify-center rounded-full bg-sangria text-white shadow-lg transition-all duration-200 hover:bg-sangria/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sangria focus-visible:ring-offset-2",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
        className
      )}
    >
      <ArrowUp className="size-5" />
    </button>
  )
}
