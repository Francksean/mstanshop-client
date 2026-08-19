"use client"

import { useEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  createCategory,
  updateCategory,
  uploadCategoryBanner,
  uploadCategoryThumbnail,
} from "@/lib/services/admin/categories.service"
import { getCategoryById } from "@/lib/services/categories.service"
import { normalizeError } from "@/lib/api-error"
import { resolveMediaUrl } from "@/lib/utils"
import type { Category } from "@/types"

const NO_PARENT = "NONE"

const categorySchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  description: z.string().optional(),
  parentId: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
  /** Full flat list — used to build the parent options and detect whether `category` already has children. */
  allCategories: Category[]
  /** Pre-fills "Catégorie parente" when opened via "Ajouter une sous-catégorie". Ignored when `category` is set. */
  defaultParentId?: string
  onSaved: () => void
}

function PendingImagePicker({
  currentUrl,
  file,
  onPick,
}: {
  currentUrl?: string | null
  file: File | null
  onPick: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrl = file ? URL.createObjectURL(file) : currentUrl ? resolveMediaUrl(currentUrl) : null

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-small font-medium tracking-wide text-ink/60 uppercase">Image</span>
      <p className="text-small text-ink/50">Utilisée à la fois comme miniature et comme bannière.</p>
      <div className="flex items-center gap-3">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" className="h-12 w-20 rounded-md object-cover" />
        ) : (
          <div className="flex h-12 w-20 items-center justify-center rounded-md border border-dashed border-black/20 text-small text-ink/40">
            Aucune
          </div>
        )}
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <Upload className="size-3.5" />
          Changer l&apos;image
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onPick(f)
            e.target.value = ""
          }}
        />
      </div>
    </div>
  )
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  allCategories,
  defaultParentId,
  onSaved,
}: CategoryFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [detail, setDetail] = useState<Category | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const isEditing = Boolean(category)

  const hasChildren = Boolean(category?.id) && allCategories.some((c) => c.parentId === category?.id)
  const parentOptions = allCategories.filter((c) => !c.parentId && c.id && c.id !== category?.id)

  const { control, handleSubmit, reset } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "", parentId: NO_PARENT },
  })

  useEffect(() => {
    async function load() {
      if (!open) return
      setImageFile(null)
      if (!category?.id) {
        setDetail(null)
        reset({ name: "", description: "", parentId: defaultParentId ?? NO_PARENT })
        return
      }
      // The list this dialog is opened from may return a slimmer shape —
      // fetch the full record so every field (esp. description) is fresh.
      setIsLoadingDetail(true)
      try {
        const full = await getCategoryById(category.id)
        const source = full ?? category
        setDetail(source)
        reset({ name: source.name, description: source.description ?? "", parentId: source.parentId ?? NO_PARENT })
      } catch (err) {
        toast.error(normalizeError(err).message)
      } finally {
        setIsLoadingDetail(false)
      }
    }

    load()
  }, [open, category, defaultParentId, reset])

  async function onSubmit(values: CategoryFormValues) {
    setIsSubmitting(true)
    try {
      const payload = {
        name: values.name,
        description: values.description,
        parentId: hasChildren ? undefined : values.parentId === NO_PARENT ? null : values.parentId,
      }
      let id: string
      if (isEditing && category?.id) {
        await updateCategory(category.id, payload)
        id = category.id
      } else {
        id = (await createCategory(payload)).id
      }

      if (imageFile) {
        await uploadCategoryThumbnail(id, imageFile)
        await uploadCategoryBanner(id, imageFile)
      }

      toast.success(isEditing ? "Catégorie mise à jour." : "Catégorie créée.")
      onOpenChange(false)
      onSaved()
    } catch (error) {
      toast.error(normalizeError(error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier la catégorie" : "Ajouter une catégorie"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

          <Controller
            name="parentId"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Catégorie parente</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={hasChildren}>
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_PARENT}>Aucune (catégorie racine)</SelectItem>
                    {parentOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id!}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasChildren && (
                  <p className="text-small text-ink/40">
                    Cette catégorie a des sous-catégories — retirez-les d&apos;abord pour lui assigner un parent.
                  </p>
                )}
              </Field>
            )}
          />

          <Separator />

          {isLoadingDetail ? (
            <p className="text-small text-ink/50">Chargement…</p>
          ) : (
            <PendingImagePicker
              currentUrl={detail?.thumbnailUrl ?? detail?.bannerUrl}
              file={imageFile}
              onPick={setImageFile}
            />
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
