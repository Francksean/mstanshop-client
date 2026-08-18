"use client"

import { use, useState } from "react"
import { notFound } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { ImageGallery } from "@/components/custom/ImageGallery"
import { SizePicker } from "@/components/custom/SizePicker"
import { ColorSwatchPicker } from "@/components/custom/ColorSwatchPicker"
import { QuantityStepper } from "@/components/custom/QuantityStepper"
import { PriceTag } from "@/components/custom/PriceTag"
import { StockBadge } from "@/components/custom/StockBadge"
import { ReviewStars } from "@/components/custom/ReviewStars"
import { ProductAccordion } from "@/components/custom/ProductAccordion"
import { ReviewSection } from "@/components/custom/ReviewSection"
import { ShareButton } from "@/components/custom/ShareButton"
import { RelatedProducts } from "@/components/custom/RelatedProducts"
import { ProductDetailShimmer } from "@/components/custom/PageShimmers/ProductDetailShimmer"
import { RetryFallback } from "@/components/custom/RetryFallback"
import { useProduct } from "@/hooks/useProduct"
import { useCart } from "@/hooks/useCart"
import { CATEGORIES } from "@/lib/constants"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const t = useTranslations("products")
  const { product, relatedProducts, isLoading, error, isNotFound } = useProduct(id)
  const { addItem } = useCart()

  const [colorHex, setColorHex] = useState<string | null>(null)
  const [size, setSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <ProductDetailShimmer />
      </div>
    )
  }

  if (error || !product) {
    if (isNotFound) notFound()
    return <RetryFallback description={error ?? undefined} onRetry={() => window.location.reload()} />
  }

  const categoryName = CATEGORIES.find((c) => c.slug === product.category)?.name ?? product.category
  const hasColors = product.colors.length > 0
  const hasSizes = product.sizes.length > 0
  const hasVariants = product.variants.length > 0

  const selectedColorHex = colorHex ?? (product.colors.length === 1 ? product.colors[0].hex : null)
  const selectedSize = size ?? (product.sizes.length === 1 ? product.sizes[0] : null)

  const sizesForColor = hasColors && selectedColorHex
    ? Array.from(
        new Set(
          product.variants
            .filter((v) => v.colorHex === selectedColorHex)
            .map((v) => v.size)
            .filter((s): s is string => Boolean(s))
        )
      )
    : product.sizes
  const disabledSizes = sizesForColor.filter((s) => {
    const v = product.variants.find(
      (v) => v.size === s && (!hasColors || v.colorHex === selectedColorHex)
    )
    return v ? !v.active || v.stock <= 0 : false
  })

  const selectedVariant = hasVariants
    ? product.variants.find(
        (v) =>
          (!hasColors || v.colorHex === selectedColorHex) &&
          (!hasSizes || v.size === selectedSize)
      )
    : null

  const isSelectionComplete = (!hasColors || Boolean(selectedColorHex)) && (!hasSizes || Boolean(selectedSize))
  const displayStock = hasVariants ? (selectedVariant?.stock ?? 0) : product.stock
  const galleryImages = selectedVariant
    ? (selectedVariant.images.length > 0
        ? selectedVariant.images
        : product.images.filter((img) => !img.variantId))
    : product.images

  function handleAddToCart() {
    if (!product) return
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity,
      productName: product.name,
      unitPrice: product.price,
      productThumbnailUrl: galleryImages[0]?.url,
      variantColorName: selectedVariant?.colorName,
      variantColorHex: selectedVariant?.colorHex,
      variantSize: selectedVariant?.size,
    })
  }

  const isOutOfStock =
    hasVariants
      ? !isSelectionComplete || !selectedVariant || !selectedVariant.active || selectedVariant.stock === 0
      : product.stock === 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <ImageGallery productName={product.name} images={galleryImages} />

        <div className="flex flex-col gap-4">
          <span className="text-small text-ink/60">{categoryName}</span>
          <h1 className="text-h1 text-ink">{product.name}</h1>
          {product.reviewCount > 0 && (
            <ReviewStars rating={product.averageRating ?? 0} reviewCount={product.reviewCount} />
          )}
          <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
          <p className="text-body text-ink/70">{product.description}</p>

          {hasColors && (
            <ColorSwatchPicker
              colors={product.colors}
              value={selectedColorHex}
              onChange={(hex) => {
                setColorHex(hex)
                setSize(null)
              }}
            />
          )}
          {hasSizes && sizesForColor.length > 0 && (
            <SizePicker sizes={sizesForColor} value={selectedSize} onChange={setSize} disabledSizes={disabledSizes} />
          )}

          <div className="flex flex-col gap-2">
            <span className="text-small font-medium tracking-wide text-ink/60 uppercase">
              {t("quantity")}
            </span>
            <QuantityStepper value={quantity} max={Math.max(displayStock, 1)} onChange={setQuantity} />
          </div>

          <StockBadge stock={displayStock} />

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="w-full sm:flex-1"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              {t("addToCart")}
            </Button>
            <ShareButton productId={product.id} />
          </div>

          <ProductAccordion product={product} />
        </div>
      </div>

      <ReviewSection productId={product.id} averageRating={product.averageRating} reviewCount={product.reviewCount} />

      <RelatedProducts products={relatedProducts} />
    </div>
  )
}
