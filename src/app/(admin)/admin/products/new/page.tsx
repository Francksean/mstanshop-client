"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { ImageBucket } from "@/components/admin/ImageBucket"
import { CategoryCombobox } from "@/components/admin/CategoryCombobox"
import { SupplierCombobox } from "@/components/admin/SupplierCombobox"
import {
  VariantRowEditor,
  isVariantRowInvalid,
  newVariantRow,
  type VariantRow,
} from "@/components/admin/VariantRowEditor"
import { getCategories } from "@/lib/services/categories.service"
import { listSuppliers } from "@/lib/services/admin/suppliers.service"
import { createProduct } from "@/lib/services/admin/products.service"
import { uploadToR2 } from "@/lib/services/admin/uploads.service"
import { normalizeError } from "@/lib/api-error"
import type { Category, Supplier } from "@/types"

const NO_SUPPLIER = "NONE"

const productSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  description: z.string().optional(),
  price: z
    .string()
    .min(1, "Le prix est requis.")
    .refine((v) => Number(v) > 0, "Le prix doit être supérieur à 0."),
  purchasePrice: z.string().optional(),
  stock: z
    .string()
    .min(1, "Le stock est requis.")
    .refine((v) => Number(v) >= 0, "Le stock ne peut pas être négatif."),
  categoryId: z.string().min(1, "La catégorie est requise."),
  supplierId: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function AdminNewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [variantRows, setVariantRows] = useState<VariantRow[]>([])
  const [isSaving, setIsSaving] = useState(false)

  function addVariantRow() {
    setVariantRows((rows) => [...rows, newVariantRow()])
  }

  function updateVariantRow(key: string, patch: Partial<VariantRow>) {
    setVariantRows((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  function removeVariantRow(key: string) {
    setVariantRows((rows) => rows.filter((r) => r.key !== key))
  }

  useEffect(() => {
    getCategories().then(setCategories)
    listSuppliers().then(setSuppliers)
  }, [])

  const { control, handleSubmit, setValue } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      purchasePrice: "",
      stock: "",
      categoryId: "",
      supplierId: NO_SUPPLIER,
    },
  })

  useEffect(() => {
    if (variantRows.length === 0) return
    const total = variantRows.reduce((sum, r) => sum + Number(r.stock || 0) * Math.max(r.sizes.length, 1), 0)
    setValue("stock", String(total), { shouldValidate: true })
  }, [variantRows, setValue])

  async function onSubmit(values: ProductFormValues) {
    if (variantRows.some(isVariantRowInvalid)) {
      toast.error("Vérifiez la couleur (hex), les tailles et le stock de chaque variante.")
      return
    }

    setIsSaving(true)
    try {
      // Product doesn't exist yet — images are pre-uploaded under a throwaway
      // client-generated id, then referenced by objectKey in the create payload.
      const entityId = crypto.randomUUID()
      const uploaded = []
      for (const file of newFiles) {
        uploaded.push(await uploadToR2("PRODUCT_IMAGE", entityId, file))
      }

      const stock =
        variantRows.length > 0
          ? variantRows.reduce((sum, r) => sum + Number(r.stock || 0) * Math.max(r.sizes.length, 1), 0)
          : Number(values.stock)

      const product = await createProduct({
        name: values.name,
        description: values.description,
        categoryId: values.categoryId,
        supplierId: values.supplierId && values.supplierId !== NO_SUPPLIER ? values.supplierId : undefined,
        price: Number(values.price),
        purchasePrice: values.purchasePrice ? Number(values.purchasePrice) : undefined,
        stock,
        images: uploaded.map((img, i) => ({ objectKey: img.objectKey, markAsThumbnail: i === 0 })),
        variants:
          variantRows.length > 0
            ? variantRows.map((r) => ({
                colorName: r.colorName || undefined,
                colorHex: r.colorHex || undefined,
                sizes: r.sizes,
                stock: Number(r.stock),
                active: r.active,
              }))
            : undefined,
      })

      toast.success("Produit créé.")
      router.push(`/admin/products/${product.id}`)
    } catch (err) {
      toast.error(normalizeError(err).message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin/products" className="flex items-center gap-1.5 text-small text-ink/60 hover:text-ink">
        <ArrowLeft className="size-4" />
        Retour aux produits
      </Link>

      <h1 className="text-h2 text-ink">Ajouter un produit</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-4">
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
              <CategoryCombobox
                id={field.name}
                categories={categories}
                value={field.value}
                onChange={field.onChange}
                invalid={fieldState.invalid}
              />
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
              <SupplierCombobox
                id={field.name}
                suppliers={suppliers}
                value={field.value ?? NO_SUPPLIER}
                onChange={field.onChange}
                noneValue={NO_SUPPLIER}
              />
            </Field>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            name="purchasePrice"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Prix d&apos;achat (FCFA)</FieldLabel>
                <Input {...field} id={field.name} type="number" step="0.01" placeholder="Optionnel" />
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="stock"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Stock</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  disabled={variantRows.length > 0}
                  aria-invalid={fieldState.invalid}
                />
                {variantRows.length > 0 ? (
                  <p className="text-small text-ink/40">Calculé depuis les variantes ci-dessous.</p>
                ) : (
                  fieldState.invalid && <FieldError errors={[fieldState.error]} />
                )}
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

        <ImageBucket
          label="Photos du produit"
          images={[]}
          onRemoveExisting={() => {}}
          newFiles={newFiles}
          onAddFiles={(files) => setNewFiles((f) => [...f, ...files])}
          onRemoveNewFile={(idx) => setNewFiles((f) => f.filter((_, i) => i !== idx))}
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
              Aucune variante — le produit sera vendu en stock unique (couleur/taille par défaut). Une ligne peut
              regrouper plusieurs tailles pour une même couleur (le stock saisi est dupliqué sur chaque taille). Les
              photos par variante s&apos;ajoutent une fois le produit créé.
            </p>
          )}

          {variantRows.map((row) => (
            <VariantRowEditor
              key={row.key}
              row={row}
              showImages={false}
              onChange={(patch) => updateVariantRow(row.key, patch)}
              onRemove={() => removeVariantRow(row.key)}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Annuler</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Création…" : "Créer le produit"}
          </Button>
        </div>
      </form>
    </div>
  )
}
