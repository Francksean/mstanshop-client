"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { AuthTabs } from "@/components/custom/AuthTabs"
import { PasswordInput } from "@/components/custom/PasswordInput"
import { useAuth } from "@/hooks/useAuth"
import { normalizeError } from "@/lib/api-error"
import { startGoogleOAuth } from "@/lib/oauth"

type LoginValues = { email: string; password: string }

function LoginForm({ redirect }: { redirect: string | null }) {
  const t = useTranslations("auth.login")
  const tAuth = useTranslations("auth")
  const tValidation = useTranslations("validation")
  const tApiErrors = useTranslations("apiErrors")
  const { login } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loginSchema = z.object({
    email: z.string().min(1, tValidation("emailRequired")).email(tValidation("emailInvalid")),
    password: z.string().min(1, tValidation("passwordRequired")),
  })

  const { control, handleSubmit } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginValues) {
    setServerError(null)
    setIsSubmitting(true)
    try {
      await login(values, redirect ?? undefined)
    } catch (error) {
      setServerError(normalizeError(error, tApiErrors).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-md bg-card p-8">
      <AuthTabs />
      <p className="mb-6 text-body text-ink/70">{t("welcomeMessage")}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>{t("email")}</FieldLabel>
              <Input {...field} id={field.name} type="email" aria-invalid={fieldState.invalid} className="h-12" />
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
              <PasswordInput {...field} id={field.name} aria-invalid={fieldState.invalid} className="h-12" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {serverError && (
          <p role="alert" className="text-small text-sangria">
            {serverError}
          </p>
        )}

        <Link
          href="#"
          className="self-end text-small text-sangria underline-offset-4 hover:underline"
        >
          {t("forgotPassword")}
        </Link>

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

function LoginPageContent() {
  const t = useTranslations("auth")
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")

  useEffect(() => {
    if (searchParams.get("reason") === "forbidden") {
      toast.error(t("restrictedAccess"))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return <LoginForm redirect={redirect} />
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  )
}
