"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { AuthTabs } from "@/components/custom/AuthTabs"
import { PasswordStrengthMeter } from "@/components/custom/PasswordStrengthMeter"
import { useAuth } from "@/hooks/useAuth"
import { normalizeError } from "@/lib/api-error"
import { startGoogleOAuth } from "@/lib/oauth"

type RegisterValues = {
  firstName: string
  lastName: string
  email: string
  password: string
}

function RegisterForm({ redirect }: { redirect: string | null }) {
  const t = useTranslations("auth.register")
  const tAuth = useTranslations("auth")
  const tValidation = useTranslations("validation")
  const tApiErrors = useTranslations("apiErrors")
  const { register } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const registerSchema = z.object({
    firstName: z.string().min(1, tValidation("firstNameRequired")),
    lastName: z.string().min(1, tValidation("lastNameRequired")),
    email: z.string().min(1, tValidation("emailRequired")).email(tValidation("emailInvalid")),
    password: z
      .string()
      .min(8, tValidation("passwordMinLength"))
      .refine((v) => /[A-Z]/.test(v), tValidation("passwordUppercase"))
      .refine((v) => /[a-z]/.test(v), tValidation("passwordLowercase"))
      .refine((v) => /\d/.test(v), tValidation("passwordDigit"))
      .refine((v) => /[@$!%*?&#^()_+=-]/.test(v), tValidation("passwordSpecialChar")),
  })

  const { control, handleSubmit, watch } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  })

  const password = watch("password")

  async function onSubmit(values: RegisterValues) {
    setServerError(null)
    setIsSubmitting(true)
    try {
      await register(values, redirect ?? undefined)
    } catch (error) {
      setServerError(normalizeError(error, tApiErrors).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-md bg-card p-8">
      <AuthTabs />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
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
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>{t("password")}</FieldLabel>
              <Input {...field} id={field.name} type="password" aria-invalid={fieldState.invalid} />
              <PasswordStrengthMeter password={password ?? ""} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {serverError && (
          <p role="alert" className="text-small text-sangria">
            {serverError}
          </p>
        )}

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>

        <div className="flex items-center gap-3 text-small text-ink/40">
          <span className="h-px flex-1 bg-black/10" />
          {tAuth("or")}
          <span className="h-px flex-1 bg-black/10" />
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={() => startGoogleOAuth(redirect)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/auth/google.jpg" alt="" className="h-5 w-5 rounded-full object-cover" />
          {tAuth("continueWithGoogle")}
        </Button>
      </form>
    </div>
  )
}

function RegisterPageContent() {
  const searchParams = useSearchParams()
  return <RegisterForm redirect={searchParams.get("redirect")} />
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageContent />
    </Suspense>
  )
}
