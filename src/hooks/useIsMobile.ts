"use client"

import { useEffect, useState } from "react"

const MOBILE_QUERY = "(max-width: 767px)"

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(mql.matches)
    function onChange(e: MediaQueryListEvent) {
      setIsMobile(e.matches)
    }
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
