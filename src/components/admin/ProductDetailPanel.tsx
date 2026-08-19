"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft, Plus } from "lucide-react"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ImageGallery } from "@/components/custom/ImageGallery"
import { ReviewStars } from "@/components/custom/ReviewStars"
import { EditableField, EditableSelectField } from "@/components/admin/EditableField"
import { ImageBucket } from "@/components/admin/ImageBucket"
import {
  VariantRowEditor,
  isVariantRowInvalid,
  newVariantRow,
  variantRowsFromProduct,
  type VariantRow,
} from "@/components/admin/VariantRowEditor"
import { getProductById } from "@/lib/services/products.service"
import { updateProduct } from "@/lib/services/admin/products.service"
import { createVariant, updateVariant, deleteVariant } from "@/lib/services/admin/variants.service"
import { uploadProductImages, deleteProductImage } from "@/lib/services/admin/images.service"
import { getCategories } from "@/lib/services/categories.service"
import { listSuppliers } from "@/lib/services/admin/suppliers.service"
import { normalizeError } from "@/lib/api-error"
import { formatPrice } from "@/lib/utils"
import type { Category, Product, ProductImage, Supplier } from "@/types"

const NO_SUPPLIER = "NONE"

interface ProductDetailPanelProps {
  productId: string
  mode: "sheet" | "page"
  onSaved?: () => void
}

export function ProductDetailPanel({ productId, mode, onSaved }: ProductDetailPanelProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  const [variantRows, setVariantRows] = useState<VariantRow[]>([])
  const [isSavingVariants, setIsSavingVariants] = useState(false)

  const [baseImages, setBaseImages] = useState<ProductImage[]>([])
  const [removedBaseImageIds, setRemovedBaseImageIds] = useState<string[]>([])
  const [newBaseFiles, setNewBaseFiles] = useState<File[]>([])
  const [isSavingImages, setIsSavingImages] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const [data, cats, sups] = await Promise.all([getProductById(productId), getCategories(), listSuppliers()])
        if (cancelled) return
        if (data) {
          setProduct(data)
          setVariantRows(variantRowsFromProduct(data))
          setBaseImages(data.images.filter((img) => !img.variantId))
          setRemovedBaseImageIds([])
          setNewBaseFiles([])
        }
        setCategories(cats)
        setSuppliers(sups)
      } catch (err) {
        if (!cancelled) setError(normalizeError(err).message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [productId])

  async function refetchProduct() {
    const data = await getProductById(productId)
    if (!data) return
    setProduct(data)
    setVariantRows(variantRowsFromProduct(data))
    setBaseImages(data.images.filter((img) => !img.variantId))
    setRemovedBaseImageIds([])
    setNewBaseFiles([])
    onSaved?.()
  }

  async function saveField(patch: Partial<{ name: string; description: string; price: number; purchasePrice?: number; stock: number; categoryId: string; supplierId?: string; active: boolean }>) {
    if (!product) return
    const payload = {
      name: patch.name ?? product.name,
      description: patch.description ?? product.description,
      price: patch.price ?? product.price,
      purchasePrice: "purchasePrice" in patch ? patch.purchasePrice : product.purchasePrice,
      stock: patch.stock ?? product.stock,
      categoryId: patch.categoryId ?? product.categoryId ?? "",
      supplierId: patch.supplierId !== undefined ? (patch.supplierId || undefined) : product.supplierId,
      active: patch.active ?? product.active,
    }
    const updated = await updateProduct(product.id, payload)
    setProduct((prev) =>
      prev
        ? {
            ...prev,
            name: updated.name,
            description: updated.description ?? "",
            price: updated.price,
            purchasePrice: updated.purchasePrice,
            stock: updated.stock,
            categoryId: updated.categoryId,
            category: updated.categoryName,
            supplierId: updated.supplierId ?? undefined,
            active: updated.active,
          }
        : prev
    )
    onSaved?.()
  }

  function addVariantRow() {
    setVariantRows((rows) => [...rows, newVariantRow()])
  }

  function updateRow(key: string, patch: Partial<VariantRow>) {
    setVariantRows((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  function removeRow(key: string) {
    setVariantRows((rows) => rows.filter((r) => r.key !== key))
  }

  async function saveVariants() {
    if (!product) return
    if (variantRows.some(isVariantRowInvalid)) {
      toast.error("Vérifiez la couleur (hex), la taille et le stock de chaque variante.")
      return
    }
    setIsSavingVariants(true)
    try {
      const keptIds = new Set(variantRows.map((r) => r.id).filter((id): id is string => Boolean(id)))
      for (const original of product.variants) {
        if (!keptIds.has(original.id)) {
          await deleteVariant(product.id, original.id)
        }
      }

      for (const row of variantRows) {
        if (row.id) {
          await updateVariant(product.id, row.id, {
            colorName: row.colorName || undefined,
            colorHex: row.colorHex || undefined,
            size: row.sizes[0] || undefined,
            stock: Number(row.stock),
            active: row.active,
          })
          for (const imageId of row.removedImageIds) {
            await deleteProductImage(product.id, imageId)
          }
          if (row.newFiles.length > 0) {
            await uploadProductImages(product.id, row.newFiles, { variantId: row.id })
          }
        } else {
          // Not yet created — one row per size is created server-side, all sharing this
          // stock. No images possible yet (no variantId to attach them to).
          await createVariant(product.id, {
            colorName: row.colorName || undefined,
            colorHex: row.colorHex || undefined,
            sizes: row.sizes,
            stock: Number(row.stock),
            active: row.active,
          })
        }
      }

      const totalStock = variantRows.reduce(
        (sum, r) => sum + Number(r.stock || 0) * (r.id ? 1 : Math.max(r.sizes.length, 1)),
        0
      )
      if (variantRows.length > 0 && totalStock !== product.stock) {
        await saveField({ stock: totalStock })
      }

      toast.success("Variantes mises à jour.")
      await refetchProduct()
    } catch (err) {
      toast.error(normalizeError(err).message)
    } finally {
      setIsSavingVariants(false)
    }
  }

  async function saveBaseImages() {
    if (!product) return
    setIsSavingImages(true)
    try {
      for (const imageId of removedBaseImageIds) {
        await deleteProductImage(product.id, imageId)
      }
      if (newBaseFiles.length > 0) {
        await uploadProductImages(product.id, newBaseFiles, { markFirstAsThumbnail: baseImages.length === 0 })
      }
      toast.success("Photos mises à jour.")
      await refetchProduct()
    } catch (err) {
      toast.error(normalizeError(err).message)
    } finally {
      setIsSavingImages(false)
    }
  }

  if (isLoading || !product) {
    return (
      <div className="flex flex-col gap-6 p-4">
        {mode === "page" && (
          <Link href="/admin/products" className="flex items-center gap-1.5 text-small text-ink/60 hover:text-ink">
            <ArrowLeft className="size-4" />
            Retour aux produits
          </Link>
        )}
        <Skeleton className="aspect-[4/3] w-full rounded-lg" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {mode === "page" && (
          <Link href="/admin/products" className="flex items-center gap-1.5 text-small text-ink/60 hover:text-ink">
            <ArrowLeft className="size-4" />
            Retour aux produits
          </Link>
        )}
        <p className="text-body text-sangria">{error}</p>
      </div>
    )
  }

  const categoryOptions = categories.map((c) => ({ value: c.id ?? c.slug, label: c.name }))
  const supplierOptions = [
    { value: NO_SUPPLIER, label: "Aucun fournisseur" },
    ...suppliers.map((s) => ({ value: s.id, label: s.name })),
  ]

  return (
    <div className="flex flex-col gap-6">
      {mode === "sheet" ? (
        <SheetHeader className="border-b border-black/10">
          <SheetTitle>{product.name}</SheetTitle>
        </SheetHeader>
      ) : (
        <div className="flex items-center gap-3 border-b border-black/10 p-4">
          <Button variant="ghost" size="icon-sm" aria-label="Retour aux produits" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h1 className="text-h2 text-ink">{product.name}</h1>
        </div>
      )}

      <div className="flex flex-col gap-6 p-4 pt-0">
        <ImageGallery productName={product.name} images={product.images} />

        <div className="flex flex-col gap-4 rounded-lg bg-cream/60 p-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <EditableField label="Nom" value={product.name} onSave={(v) => saveField({ name: v })} />
            <EditableSelectField
              label="Catégorie"
              value={product.categoryId ?? ""}
              displayValue={product.category}
              options={categoryOptions}
              onSave={(v) => saveField({ categoryId: v })}
            />
            <EditableSelectField
              label="Fournisseur"
              value={product.supplierId ?? NO_SUPPLIER}
              displayValue={product.supplierName ?? "Aucun fournisseur"}
              options={supplierOptions}
              onSave={(v) => saveField({ supplierId: v === NO_SUPPLIER ? undefined : v })}
            />
            <EditableField
              label="Prix (FCFA)"
              type="number"
              value={String(product.price)}
              displayValue={formatPrice(product.price)}
              onSave={(v) => saveField({ price: Number(v) })}
            />
            <EditableField
              label="Prix d'achat (FCFA)"
              type="number"
              value={String(product.purchasePrice ?? "")}
              displayValue={product.purchasePrice !== undefined ? formatPrice(product.purchasePrice) : "—"}
              onSave={(v) => saveField({ purchasePrice: v ? Number(v) : undefined })}
            />
            {variantRows.length > 0 ? (
              <EditableField
                label="Stock"
                value={String(product.stock)}
                readOnlyHint="Calculé depuis les variantes"
              />
            ) : (
              <EditableField
                label="Stock"
                type="number"
                value={String(product.stock)}
                onSave={(v) => saveField({ stock: Number(v) })}
              />
            )}
            {product.reviewCount > 0 && (
              <div className="flex flex-col gap-0.5">
                <span className="text-small text-ink/50">Avis</span>
                <ReviewStars rating={product.averageRating ?? 0} reviewCount={product.reviewCount} />
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-body text-ink">
            <Checkbox
              checked={product.active}
              onCheckedChange={(v) => saveField({ active: Boolean(v) }).catch((err) => toast.error(normalizeError(err).message))}
            />
            Produit actif (visible dans le catalogue)
          </label>
        </div>

        <EditableField
          label="Description"
          type="textarea"
          value={product.description}
          onSave={(v) => saveField({ description: v })}
        />

        <Separator />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-small font-medium tracking-wide text-ink/60 uppercase">Couleurs & tailles</span>
            <Button type="button" variant="outline" size="sm" onClick={addVariantRow}>
              <Plus className="size-4" />
              Ajouter une variante
            </Button>
          </div>

          {variantRows.length === 0 && (
            <p className="text-small text-ink/50">
              Aucune variante — le produit est vendu en stock unique (couleur/taille par défaut).
            </p>
          )}

          {variantRows.map((row) => (
            <VariantRowEditor
              key={row.key}
              row={row}
              showImages={Boolean(row.id)}
              onChange={(patch) => updateRow(row.key, patch)}
              onRemove={() => removeRow(row.key)}
            />
          ))}

          {variantRows.length > 0 && (
            <Button type="button" onClick={saveVariants} disabled={isSavingVariants} className="self-start">
              {isSavingVariants ? "Enregistrement…" : "Enregistrer les variantes"}
            </Button>
          )}
        </div>

        {variantRows.length === 0 && (
          <>
            <Separator />
            <div className="flex flex-col gap-3">
              <ImageBucket
                label="Photos du produit"
                images={baseImages}
                onRemoveExisting={(id) => {
                  setBaseImages((imgs) => imgs.filter((i) => i.id !== id))
                  setRemovedBaseImageIds((ids) => [...ids, id])
                }}
                newFiles={newBaseFiles}
                onAddFiles={(files) => setNewBaseFiles((f) => [...f, ...files])}
                onRemoveNewFile={(idx) => setNewBaseFiles((f) => f.filter((_, i) => i !== idx))}
              />
              {(removedBaseImageIds.length > 0 || newBaseFiles.length > 0) && (
                <Button type="button" onClick={saveBaseImages} disabled={isSavingImages} className="self-start">
                  {isSavingImages ? "Enregistrement…" : "Enregistrer les photos"}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
