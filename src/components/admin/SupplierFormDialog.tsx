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
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog"
import { createSupplier, updateSupplier } from "@/lib/services/admin/suppliers.service"
import type { Supplier } from "@/types"

const supplierSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  primaryPhone: z.string().min(1, "Le téléphone principal est requis."),
  secondaryPhone: z.string().optional(),
  location: z.string().optional(),
})

type SupplierFormValues = z.infer<typeof supplierSchema>

interface SupplierFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: Supplier | null
  onSaved: () => void
}

export function SupplierFormDialog({ open, onOpenChange, supplier, onSaved }: SupplierFormDialogProps) {
  const [pendingValues, setPendingValues] = useState<SupplierFormValues | null>(null)
  const isEditing = Boolean(supplier)

  const { control, handleSubmit, reset } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { name: "", primaryPhone: "", secondaryPhone: "", location: "" },
  })

  useEffect(() => {
    if (!open) return
    reset({
      name: supplier?.name ?? "",
      primaryPhone: supplier?.primaryPhone ?? "",
      secondaryPhone: supplier?.secondaryPhone ?? "",
      location: supplier?.location ?? "",
    })
  }, [open, supplier, reset])

  function onSubmit(values: SupplierFormValues) {
    setPendingValues(values)
  }

  async function performSave() {
    if (!pendingValues) return
    const payload = {
      name: pendingValues.name,
      primaryPhone: pendingValues.primaryPhone,
      secondaryPhone: pendingValues.secondaryPhone || undefined,
      location: pendingValues.location || undefined,
    }
    if (isEditing && supplier) {
      await updateSupplier(supplier.id, payload)
    } else {
      await createSupplier(payload)
    }
    toast.success(isEditing ? "Fournisseur mis à jour." : "Fournisseur créé.")
    onOpenChange(false)
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier le fournisseur" : "Ajouter un fournisseur"}</DialogTitle>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="primaryPhone"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Téléphone principal</FieldLabel>
                  <Input {...field} id={field.name} type="tel" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="secondaryPhone"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Téléphone secondaire</FieldLabel>
                  <Input {...field} id={field.name} type="tel" placeholder="Facultatif" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <Controller
            name="location"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Localisation</FieldLabel>
                <Input {...field} id={field.name} placeholder="Facultatif" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
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
            ? `Le fournisseur "${pendingValues?.name}" sera mis à jour.`
            : `Le fournisseur "${pendingValues?.name}" sera créé.`
        }
        confirmLabel="Confirmer"
        pendingLabel="Enregistrement…"
        onConfirm={performSave}
      />
    </Dialog>
  )
}
