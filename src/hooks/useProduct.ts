"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { getProductById, getRelatedProducts } from "@/lib/services/products.service"
import { normalizeError } from "@/lib/api-error"
import type { Product } from "@/types"

interface UseProductResult {
  product: Product | null
  relatedProducts: Product[]
  isLoading: boolean
  error: string | null
  isNotFound: boolean
}

export function useProduct(id: string): UseProductResult {
  const t = useTranslations("apiErrors")
  const tProducts = useTranslations("products")
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loadedId, setLoadedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isNotFound, setIsNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    getProductById(id)
      .then(async (found) => {
        if (cancelled) return
        if (!found) {
          setProduct(null)
          setRelatedProducts([])
          setError(tProducts("notFound"))
          setIsNotFound(true)
          setLoadedId(id)
          return
        }
        const related = await getRelatedProducts(found.id)
        if (cancelled) return
        setProduct(found)
        setRelatedProducts(related)
        setError(null)
        setIsNotFound(false)
        setLoadedId(id)
      })
      .catch((err) => {
        if (cancelled) return
        setError(normalizeError(err, t).message)
        setIsNotFound(false)
        setLoadedId(id)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return {
    product,
    relatedProducts,
    isLoading: loadedId !== id,
    error: loadedId === id ? error : null,
    isNotFound: loadedId === id ? isNotFound : false,
  }
}
