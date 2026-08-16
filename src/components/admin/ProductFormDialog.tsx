"use client"

import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, Trash2, Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog"
import { getCategories } from "@/lib/services/categories.service"
import { listSuppliers } from "@/lib/services/admin/suppliers.service"
import { createProduct, updateProduct } from "@/lib/services/admin/products.service"
import { createVariant, updateVariant, deleteVariant } from "@/lib/services/admin/variants.service"
import { uploadProductImages, deleteProductImage } from "@/lib/services/admin/images.service"
import { normalizeError } from "@/lib/api-error"
import { resolveMediaUrl } from "@/lib/utils"
import type { Category, Product, ProductImage, Supplier } from "@/types"

const NO_SUPPLIER = "NONE"

const productSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  description: z.string().optional(),
  price: z
    .string()
    .min(1, "Le prix est requis.")
    .refine((v) => Number(v) > 0, "Le prix doit être supérieur à 0."),
  stock: z
    .string()
    .min(1, "Le stock est requis.")
    .refine((v) => Number(v) >= 0, "Le stock ne peut pas être négatif."),
  categoryId: z.string().min(1, "La catégorie est requise."),
  supplierId: z.string().optional(),
  active: z.boolean(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface VariantRow {
  key: string
  id?: string
  colorName: string
  colorHex: string
  size: string
  stock: string
  active: boolean
  existingImages: ProductImage[]
  removedImageIds: string[]
  newFiles: File[]
}

let rowCounter = 0
function newRow(): VariantRow {
  rowCounter += 1
  return {
    key: `row-${rowCounter}`,
    colorName: "",
    colorHex: "#000000",
    size: "",
    stock: "0",
    active: true,
    existingImages: [],
    removedImageIds: [],
    newFiles: [],
  }
}

const HEX_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onSaved: () => void
}

export function ProductFormDialog({ open, onOpenChange, product, onSaved }: ProductFormDialogProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [pendingValues, setPendingValues] = useState<ProductFormValues | null>(null)
  const [variantRows, setVariantRows] = useState<VariantRow[]>([])
  const [baseImages, setBaseImages] = useState<ProductImage[]>([])
  const [removedBaseImageIds, setRemovedBaseImageIds] = useState<string[]>([])
  const [newBaseFiles, setNewBaseFiles] = useState<File[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const isEditing = Boolean(product)

  const { control, handleSubmit, reset } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      stock: "",
      categoryId: "",
      supplierId: NO_SUPPLIER,
      active: true,
    },
  })

  useEffect(() => {
    if (!open) return
    getCategories().then(setCategories)
    listSuppliers().then(setSuppliers)
    reset({
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product ? String(product.price) : "",
      stock: product ? String(product.stock) : "",
      categoryId: product?.categoryId ?? "",
      supplierId: product?.supplierId ?? NO_SUPPLIER,
      active: product?.active ?? true,
    })
    setVariantRows(
      (product?.variants ?? []).map((v) => ({
        key: v.id,
        id: v.id,
        colorName: v.colorName ?? "",
        colorHex: v.colorHex,
        size: v.size ?? "",
        stock: String(v.stock),
        active: v.active,
        existingImages: v.images,
        removedImageIds: [],
        newFiles: [],
      }))
    )
    setBaseImages((product?.images ?? []).filter((img) => !img.variantId))
    setRemovedBaseImageIds([])
    setNewBaseFiles([])
  }, [open, product, reset])

  function addVariantRow() {
    setVariantRows((rows) => [...rows, newRow()])
  }

  function updateRow(key: string, patch: Partial<VariantRow>) {
    setVariantRows((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  function removeRow(key: string) {
    setVariantRows((rows) => rows.filter((r) => r.key !== key))
  }

  function invalidVariantRows() {
    return variantRows.filter((r) => !HEX_REGEX.test(r.colorHex) || Number(r.stock) < 0)
  }

  function onSubmit(values: ProductFormValues) {
    if (invalidVariantRows().length > 0) {
      toast.error("Vérifiez la couleur (hex) et le stock de chaque variante.")
      return
    }
    setPendingValues(values)
  }

  async function performSave() {
    if (!pendingValues) return
    setIsSaving(true)
    try {
      const totalVariantStock = variantRows.reduce((sum, r) => sum + Number(r.stock || 0), 0)
      const payload = {
        name: pendingValues.name,
        description: pendingValues.description,
        categoryId: pendingValues.categoryId,
        supplierId:
          pendingValues.supplierId && pendingValues.supplierId !== NO_SUPPLIER
            ? pendingValues.supplierId
            : undefined,
        price: Number(pendingValues.price),
        stock: variantRows.length > 0 ? totalVariantStock : Number(pendingValues.stock),
        ...(isEditing ? { active: pendingValues.active } : {}),
      }

      let productId: string
      if (isEditing && product) {
        await updateProduct(product.id, payload)
        productId = product.id
      } else {
        productId = (await createProduct(payload)).id
      }

      // Reconcile variants: delete removed, update existing, create new.
      const keptIds = new Set(variantRows.map((r) => r.id).filter((id): id is string => Boolean(id)))
      const originalIds = (product?.variants ?? []).map((v) => v.id)
      for (const originalId of originalIds) {
        if (!keptIds.has(originalId)) {
          await deleteVariant(productId, originalId)
        }
      }

      for (const row of variantRows) {
        const variantPayload = {
          colorName: row.colorName || undefined,
          colorHex: row.colorHex,
          size: row.size || undefined,
          stock: Number(row.stock),
          active: row.active,
        }
        let variantId = row.id
        if (variantId) {
          await updateVariant(productId, variantId, variantPayload)
        } else {
          const created = await createVariant(productId, variantPayload)
          variantId = created.id
        }
        for (const imageId of row.removedImageIds) {
          await deleteProductImage(productId, imageId)
        }
        if (row.newFiles.length > 0) {
          await uploadProductImages(productId, row.newFiles, {
            variantId,
            markFirstAsThumbnail: !isEditing && variantRows[0]?.key === row.key && baseImages.length === 0,
          })
        }
      }

      for (const imageId of removedBaseImageIds) {
        await deleteProductImage(productId, imageId)
      }
      if (newBaseFiles.length > 0) {
        await uploadProductImages(productId, newBaseFiles, {
          markFirstAsThumbnail: baseImages.length === 0,
        })
      }

      toast.success(isEditing ? "Produit mis à jour." : "Produit créé.")
      onOpenChange(false)
      onSaved()
    } catch (error) {
      toast.error(normalizeError(error).message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier le produit" : "Ajouter un produit"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nom</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="categoryId"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Catégorie</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id ?? c.slug} value={c.id ?? c.slug}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="supplierId"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Fournisseur</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Aucun fournisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_SUPPLIER}>Aucun fournisseur</SelectItem>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="price"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Prix (FCFA)</FieldLabel>
                    <Input {...field} id={field.name} type="number" step="0.01" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="stock"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Stock {variantRows.length > 0 && <span className="text-ink/40">(calculé depuis les variantes)</span>}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      disabled={variantRows.length > 0}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {isEditing && (
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center gap-2 text-body text-ink">
                    <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
                    Produit actif (visible dans le catalogue)
                  </label>
                )}
              />
            )}
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-small font-medium tracking-wide text-ink/60 uppercase">
                Couleurs & tailles
              </span>
              <Button type="button" variant="outline" size="sm" onClick={addVariantRow}>
                <Plus className="size-4" />
                Ajouter une variante
              </Button>
            </div>

            {variantRows.length === 0 && (
              <p className="text-small text-ink/50">
                Aucune variante — le produit sera vendu en stock unique (couleur/taille par défaut).
              </p>
            )}

            {variantRows.map((row) => (
              <VariantRowEditor
                key={row.key}
                row={row}
                onChange={(patch) => updateRow(row.key, patch)}
                onRemove={() => removeRow(row.key)}
              />
            ))}
          </div>

          {variantRows.length === 0 && (
            <>
              <Separator />
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
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <DeleteConfirmDialog
        open={Boolean(pendingValues)}
        onOpenChange={(v) => !v && !isSaving && setPendingValues(null)}
        variant="default"
        title={isEditing ? "Confirmer la modification ?" : "Confirmer la création ?"}
        description={
          isEditing
            ? `Les informations du produit "${pendingValues?.name}" seront mises à jour.`
            : `Le produit "${pendingValues?.name}" sera ajouté au catalogue.`
        }
        confirmLabel="Confirmer"
        pendingLabel="Enregistrement…"
        onConfirm={performSave}
      />
    </Dialog>
  )
}

function VariantRowEditor({
  row,
  onChange,
  onRemove,
}: {
  row: VariantRow
  onChange: (patch: Partial<VariantRow>) => void
  onRemove: () => void
}) {
  const isHexValid = HEX_REGEX.test(row.colorHex)

  return (
    <div className="flex flex-col gap-3 rounded-md border border-black/10 p-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field data-invalid={!isHexValid}>
          <FieldLabel>Couleur</FieldLabel>
          <div className="flex items-center gap-2">
            <Input
              value={row.colorHex}
              onChange={(e) => onChange({ colorHex: e.target.value })}
              placeholder="#8B0000"
              aria-invalid={!isHexValid}
              className="flex-1"
            />
            <input
              type="color"
              value={isHexValid && row.colorHex.length === 7 ? row.colorHex : "#000000"}
              onChange={(e) => onChange({ colorHex: e.target.value })}
              className="h-9 w-9 shrink-0 rounded-md border border-black/10"
              aria-label="Sélecteur de couleur"
            />
          </div>
        </Field>
        <Field>
          <FieldLabel>Nom couleur</FieldLabel>
          <Input value={row.colorName} onChange={(e) => onChange({ colorName: e.target.value })} placeholder="Bordeaux" />
        </Field>
        <Field>
          <FieldLabel>Taille</FieldLabel>
          <Input value={row.size} onChange={(e) => onChange({ size: e.target.value })} placeholder="M" />
        </Field>
        <Field data-invalid={Number(row.stock) < 0}>
          <FieldLabel>Stock</FieldLabel>
          <Input type="number" value={row.stock} onChange={(e) => onChange({ stock: e.target.value })} />
        </Field>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-small text-ink">
          <Checkbox checked={row.active} onCheckedChange={(v) => onChange({ active: Boolean(v) })} />
          Variante active
        </label>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Supprimer la variante" onClick={onRemove}>
          <Trash2 className="size-4 text-sangria" />
        </Button>
      </div>

      <ImageBucket
        label="Photos de cette couleur"
        images={row.existingImages}
        onRemoveExisting={(id) =>
          onChange({
            existingImages: row.existingImages.filter((i) => i.id !== id),
            removedImageIds: [...row.removedImageIds, id],
          })
        }
        newFiles={row.newFiles}
        onAddFiles={(files) => onChange({ newFiles: [...row.newFiles, ...files] })}
        onRemoveNewFile={(idx) => onChange({ newFiles: row.newFiles.filter((_, i) => i !== idx) })}
      />
    </div>
  )
}

function ImageBucket({
  label,
  images,
  onRemoveExisting,
  newFiles,
  onAddFiles,
  onRemoveNewFile,
}: {
  label: string
  images: ProductImage[]
  onRemoveExisting: (id: string) => void
  newFiles: File[]
  onAddFiles: (files: File[]) => void
  onRemoveNewFile: (index: number) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-small font-medium text-ink/60">{label}</span>
      <div className="flex flex-wrap gap-2">
        {images.map((img) => (
          <div key={img.id} className="group relative size-16 overflow-hidden rounded-md border border-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolveMediaUrl(img.url)} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label="Retirer cette image"
              onClick={() => onRemoveExisting(img.id)}
              className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        ))}
        {newFiles.map((file, idx) => (
          <div key={idx} className="group relative size-16 overflow-hidden rounded-md border border-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label="Retirer cette image"
              onClick={() => onRemoveNewFile(idx)}
              className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        ))}
        <label className="flex size-16 shrink-0 cursor-pointer items-center justify-center rounded-md border border-dashed border-black/20 text-ink/40 hover:bg-cream/40">
          <Upload className="size-4" />
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) onAddFiles(Array.from(e.target.files))
              e.target.value = ""
            }}
          />
        </label>
      </div>
    </div>
  )
}
