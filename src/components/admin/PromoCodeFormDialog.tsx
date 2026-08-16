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
import { createPromoCode, updatePromoCode } from "@/lib/services/admin/promo.service"
import type { PromoCode } from "@/types"

const promoSchema = z.object({
  code: z.string().min(1, "Le code est requis."),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z
    .string()
    .min(1, "La valeur est requise.")
    .refine((v) => Number(v) > 0, "La valeur doit être supérieure à 0."),
  expiresAt: z.string().optional(),
  minOrderAmount: z.string().optional(),
  maxUses: z.string().optional(),
  active: z.boolean(),
})

type PromoFormValues = z.infer<typeof promoSchema>

interface PromoCodeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promoCode?: PromoCode | null
  onSaved: () => void
}

export function PromoCodeFormDialog({ open, onOpenChange, promoCode, onSaved }: PromoCodeFormDialogProps) {
  const [pendingValues, setPendingValues] = useState<PromoFormValues | null>(null)
  const isEditing = Boolean(promoCode)

  const { control, handleSubmit, reset } = useForm<PromoFormValues>({
    resolver: zodResolver(promoSchema),
    defaultValues: {
      code: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      expiresAt: "",
      minOrderAmount: "",
      maxUses: "",
      active: true,
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      code: promoCode?.code ?? "",
      discountType: promoCode?.discountType ?? "PERCENTAGE",
      discountValue: promoCode ? String(promoCode.discountValue) : "",
      expiresAt: promoCode?.expiresAt ? promoCode.expiresAt.slice(0, 10) : "",
      minOrderAmount: promoCode?.minOrderAmount !== undefined ? String(promoCode.minOrderAmount) : "",
      maxUses: promoCode?.maxUses !== undefined ? String(promoCode.maxUses) : "",
      active: promoCode?.active ?? true,
    })
  }, [open, promoCode, reset])

  function onSubmit(values: PromoFormValues) {
    setPendingValues(values)
  }

  async function performSave() {
    if (!pendingValues) return
    const payload = {
      code: pendingValues.code,
      discountType: pendingValues.discountType,
      discountValue: Number(pendingValues.discountValue),
      expiresAt: pendingValues.expiresAt ? new Date(pendingValues.expiresAt).toISOString() : undefined,
      minOrderAmount: pendingValues.minOrderAmount ? Number(pendingValues.minOrderAmount) : undefined,
      maxUses: pendingValues.maxUses ? Number(pendingValues.maxUses) : undefined,
      active: pendingValues.active,
    }
    if (isEditing && promoCode) {
      await updatePromoCode(promoCode.id, payload)
    } else {
      await createPromoCode(payload)
    }
    toast.success(isEditing ? "Code promo mis à jour." : "Code promo créé.")
    onOpenChange(false)
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier le code promo" : "Ajouter un code promo"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Controller
            name="code"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Code</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="discountType"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
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
              name="minOrderAmount"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Montant minimum (€)</FieldLabel>
                  <Input {...field} id={field.name} type="number" step="0.01" placeholder="Aucun" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="maxUses"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Utilisations max.</FieldLabel>
                  <Input {...field} id={field.name} type="number" placeholder="Illimité" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <Controller
            name="expiresAt"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Date d&apos;expiration</FieldLabel>
                <Input {...field} id={field.name} type="date" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-body text-ink">
                <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
                Actif
              </label>
            )}
          />

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
        onOpenChange={(v) => !v && setPendingValues(null)}
        variant="default"
        title={isEditing ? "Confirmer la modification ?" : "Confirmer la création ?"}
        description={
          isEditing
            ? `Le code promo "${pendingValues?.code}" sera mis à jour.`
            : `Le code promo "${pendingValues?.code}" sera créé.`
        }
        confirmLabel="Confirmer"
        pendingLabel="Enregistrement…"
        onConfirm={performSave}
      />
    </Dialog>
  )
}
