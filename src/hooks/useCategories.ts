"use client"

import { useEffect, useState } from "react"
import { getCategories } from "@/lib/services/categories.service"
import type { Category } from "@/types"

export function useCategories(): { categories: Category[]; isLoading: boolean } {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getCategories().then((data) => {
      if (!cancelled) {
        setCategories(data)
        setIsLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { categories, isLoading }
}
