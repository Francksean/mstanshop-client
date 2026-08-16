"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { useAuthStore } from "@/stores/useAuthStore"
import { updateProfile } from "@/lib/services/users.service"
import type { User } from "@/types"

export function ProfileForm({ user }: { user: User }) {
  const t = useTranslations("account.profile")
  const tValidation = useTranslations("validation")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const profileSchema = z.object({
    firstName: z.string().min(1, tValidation("firstNameRequired")),
    lastName: z.string().min(1, tValidation("lastNameRequired")),
    email: z.string().min(1, tValidation("emailRequired")).email(tValidation("emailInvalid")),
    phone: z.string().optional(),
  })
  type ProfileValues = z.infer<typeof profileSchema>

  const { control, handleSubmit } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? "",
    },
  })

  async function onSubmit(values: ProfileValues) {
    setIsSubmitting(true)
    try {
      const updated = await updateProfile(user.id, values)
      useAuthStore.setState({ user: updated })
      toast.success(t("updated"))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("updateFailed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 rounded-md bg-card p-8">
      <h2 className="text-h2 text-ink">{t("title")}</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          name="firstName"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>{t("firstName")}</FieldLabel>
              <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="lastName"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>{t("lastName")}</FieldLabel>
              <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>{t("email")}</FieldLabel>
            <Input {...field} id={field.name} type="email" aria-invalid={fieldState.invalid} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="phone"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>{t("phone")}</FieldLabel>
            <Input {...field} id={field.name} type="tel" aria-invalid={fieldState.invalid} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Link href="#" className="self-start text-small text-sangria underline-offset-4 hover:underline">
        {t("changePassword")}
      </Link>

      <Button type="submit" size="lg" className="self-start" disabled={isSubmitting}>
        {isSubmitting ? t("saving") : t("save")}
      </Button>
    </form>
  )
}
