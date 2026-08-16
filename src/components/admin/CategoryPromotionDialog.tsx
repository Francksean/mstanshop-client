"use client"

import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog"
import { setCategoryPromotion, removeCategoryPromotion } from "@/lib/services/admin/categories.service"
import { normalizeError } from "@/lib/api-error"
import type { Category } from "@/types"

const promotionSchema = z.object({
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z
    .string()
    .min(1, "La valeur est requise.")
    .refine((v) => Number(v) > 0, "La valeur doit être supérieure à 0."),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  active: z.boolean(),
})

type PromotionFormValues = z.infer<typeof promotionSchema>

interface CategoryPromotionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
  onSaved: () => void
}

export function CategoryPromotionDialog({
  open,
  onOpenChange,
  category,
  onSaved,
}: CategoryPromotionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [removing, setRemoving] = useState(false)

  const { control, handleSubmit, reset } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      discountType: "PERCENTAGE",
      discountValue: "",
      startsAt: "",
      endsAt: "",
      active: true,
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      discountType: category?.promoDiscountType ?? "PERCENTAGE",
      discountValue: category?.promoDiscountValue !== undefined ? String(category.promoDiscountValue) : "",
      startsAt: "",
      endsAt: category?.promoEndsAt ? category.promoEndsAt.slice(0, 10) : "",
      active: category?.promoActive ?? true,
    })
  }, [open, category, reset])

  async function onSubmit(values: PromotionFormValues) {
    if (!category?.id) return
    setIsSubmitting(true)
    try {
      await setCategoryPromotion(category.id, {
        discountType: values.discountType,
        discountValue: Number(values.discountValue),
        startsAt: values.startsAt ? new Date(values.startsAt).toISOString() : undefined,
        endsAt: values.endsAt ? new Date(values.endsAt).toISOString() : undefined,
        active: values.active,
      })
      toast.success("Promotion enregistrée.")
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
          <DialogTitle>Promotion — {category?.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="discountType"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Type de réduction</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Pourcentage</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Montant fixe</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              name="discountValue"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Valeur</FieldLabel>
                  <Input {...field} id={field.name} type="number" step="0.01" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="startsAt"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Début (facultatif)</FieldLabel>
                  <Input {...field} id={field.name} type="date" />
                </Field>
              )}
            />
            <Controller
              name="endsAt"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Fin (facultatif)</FieldLabel>
                  <Input {...field} id={field.name} type="date" />
                </Field>
              )}
            />
          </div>

          <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-body text-ink">
                <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
                Active
              </label>
            )}
          />

          <DialogFooter className="sm:justify-between">
            {category?.promoDiscountType && (
              <Button type="button" variant="destructive" onClick={() => setRemoving(true)}>
                Supprimer la promotion
              </Button>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </DialogFooter>
        </form>

        <DeleteConfirmDialog
          open={removing}
          onOpenChange={setRemoving}
          title="Supprimer cette promotion ?"
          description={`La promotion de "${category?.name}" sera désactivée.`}
          onConfirm={async () => {
            if (!category?.id) return
            await removeCategoryPromotion(category.id)
            toast.success("Promotion supprimée.")
            onOpenChange(false)
            onSaved()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
