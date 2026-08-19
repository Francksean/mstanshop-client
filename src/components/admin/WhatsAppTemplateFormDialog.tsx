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
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog"
import { createWhatsAppTemplate, updateWhatsAppTemplate } from "@/lib/services/admin/whatsapp-templates.service"
import type { WhatsAppTemplate, WhatsAppTemplateComponent, WhatsAppTemplateEventCode } from "@/types"

const NO_EVENT = "NONE"

const EVENT_LABELS: Record<WhatsAppTemplateEventCode, string> = {
  ORDER_CONFIRMATION: "Confirmation de commande",
  PAYMENT_FAILED: "Échec de paiement",
  ORDER_CANCELLATION: "Annulation de commande",
}

const templateSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis.")
    .regex(/^[a-z0-9_]+$/, "Uniquement lettres minuscules, chiffres et underscores."),
  language: z.enum(["fr", "en"]),
  category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"]),
  eventCode: z.string(),
  header: z.string().optional(),
  body: z.string().min(1, "Le corps du message est requis."),
  footer: z.string().optional(),
})

type TemplateFormValues = z.infer<typeof templateSchema>

function componentsToValues(components: WhatsAppTemplateComponent[]) {
  return {
    header: components.find((c) => c.type === "HEADER")?.text ?? "",
    body: components.find((c) => c.type === "BODY")?.text ?? "",
    footer: components.find((c) => c.type === "FOOTER")?.text ?? "",
  }
}

function valuesToComponents(values: TemplateFormValues): WhatsAppTemplateComponent[] {
  const components: WhatsAppTemplateComponent[] = []
  if (values.header?.trim()) components.push({ type: "HEADER", text: values.header.trim() })
  components.push({ type: "BODY", text: values.body.trim() })
  if (values.footer?.trim()) components.push({ type: "FOOTER", text: values.footer.trim() })
  return components
}

interface WhatsAppTemplateFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: WhatsAppTemplate | null
  onSaved: () => void
}

export function WhatsAppTemplateFormDialog({
  open,
  onOpenChange,
  template,
  onSaved,
}: WhatsAppTemplateFormDialogProps) {
  const [pendingValues, setPendingValues] = useState<TemplateFormValues | null>(null)
  const isEditing = Boolean(template)
  const wasApproved = template?.status === "APPROVED"

  const { control, handleSubmit, reset } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      language: "fr",
      category: "UTILITY",
      eventCode: NO_EVENT,
      header: "",
      body: "",
      footer: "",
    },
  })

  useEffect(() => {
    if (!open) return
    const componentValues = template ? componentsToValues(template.components) : { header: "", body: "", footer: "" }
    reset({
      name: template?.name ?? "",
      language: (template?.language as "fr" | "en") ?? "fr",
      category: template?.category ?? "UTILITY",
      eventCode: template?.eventCode ?? NO_EVENT,
      ...componentValues,
    })
  }, [open, template, reset])

  function onSubmit(values: TemplateFormValues) {
    setPendingValues(values)
  }

  async function performSave() {
    if (!pendingValues) return
    const payload = {
      name: pendingValues.name,
      language: pendingValues.language,
      category: pendingValues.category,
      eventCode:
        pendingValues.eventCode === NO_EVENT ? null : (pendingValues.eventCode as WhatsAppTemplateEventCode),
      components: valuesToComponents(pendingValues),
    }
    if (isEditing && template) {
      await updateWhatsAppTemplate(template.id, payload)
    } else {
      await createWhatsAppTemplate(payload)
    }
    toast.success(isEditing ? "Template mis à jour." : "Template créé.")
    onOpenChange(false)
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier le template" : "Ajouter un template"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nom</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  disabled={isEditing}
                  placeholder="order_confirmation_fr"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="language"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Langue</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">Anglais</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Catégorie</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTILITY">Utilitaire</SelectItem>
                      <SelectItem value="MARKETING">Marketing</SelectItem>
                      <SelectItem value="AUTHENTICATION">Authentification</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>

          <Controller
            name="eventCode"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Déclencheur automatique</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_EVENT}>Aucun (manuel)</SelectItem>
                    {Object.entries(EVENT_LABELS).map(([code, label]) => (
                      <SelectItem key={code} value={code}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            name="header"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>En-tête (optionnel)</FieldLabel>
                <Input {...field} id={field.name} placeholder="Aucun" />
              </Field>
            )}
          />

          <Controller
            name="body"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Corps du message</FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  rows={4}
                  placeholder="Bonjour {{customer_name}}, votre commande {{order_number}}…"
                  aria-invalid={fieldState.invalid}
                />
                <p className="text-small text-ink/50">
                  {"Utilisez des variables nommées au format {{nom_variable}}."}
                </p>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="footer"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Pied de page (optionnel)</FieldLabel>
                <Input {...field} id={field.name} placeholder="Aucun" />
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
        title={
          wasApproved
            ? "Ce template est approuvé"
            : isEditing
              ? "Confirmer la modification ?"
              : "Confirmer la création ?"
        }
        description={
          wasApproved
            ? `La modification va supprimer et recréer "${pendingValues?.name}" chez Meta : il repassera en attente de validation et les envois automatiques ${template?.eventCode ? `liés à "${EVENT_LABELS[template.eventCode]}" ` : ""}échoueront jusqu'à la nouvelle approbation. Continuer ?`
            : isEditing
              ? `Le template "${pendingValues?.name}" sera mis à jour.`
              : `Le template "${pendingValues?.name}" sera créé.`
        }
        confirmLabel="Confirmer"
        pendingLabel="Enregistrement…"
        onConfirm={performSave}
      />
    </Dialog>
  )
}
