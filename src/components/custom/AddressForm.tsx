"use client"

import { Controller, useWatch, type Control } from "react-hook-form"
import { z } from "zod"
import { isValidPhoneNumber, type CountryCode } from "libphonenumber-js"
import { useTranslations } from "next-intl"
import { User, Globe, MapPin, Home, Phone, MessageCircle } from "lucide-react"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { CountryCombobox } from "@/components/custom/CountryCombobox"
import { DEFAULT_COUNTRY_CODE, getCountryByCode } from "@/lib/countries"

function RequiredFieldLabel({ icon: Icon, children, htmlFor }: { icon: React.ElementType; children: React.ReactNode; htmlFor: string }) {
  return (
    <FieldLabel htmlFor={htmlFor} className="items-center gap-1.5">
      <Icon className="size-4 text-ink/50" />
      {children}
      <span className="text-sangria">*</span>
    </FieldLabel>
  )
}

/** Pass `useTranslations("validation")` from the calling page. */
type Translate = (key: string) => string

export function createAddressSchema(t: Translate) {
  return z
    .object({
      firstName: z.string().min(1, t("firstNameRequired")),
      lastName: z.string().min(1, t("lastNameRequired")),
      street: z.string().min(1, t("streetRequired")),
      city: z.string().min(1, t("cityRequired")),
      country: z.string().min(1, t("countryRequired")),
      phone: z.string().min(1, t("phoneRequired")),
      whatsapp: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const country = data.country as CountryCode
      if (!isValidPhoneNumber(data.phone, country)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone"],
          message: t("phoneInvalid"),
        })
      }
      if (data.whatsapp && !isValidPhoneNumber(data.whatsapp, country)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["whatsapp"],
          message: t("whatsappInvalid"),
        })
      }
    })
}

export type AddressFormValues = {
  firstName: string
  lastName: string
  street: string
  city: string
  country: string
  phone: string
  whatsapp?: string
}

export const addressFormDefaults: Partial<AddressFormValues> = {
  country: DEFAULT_COUNTRY_CODE,
}

interface AddressFormProps {
  control: Control<AddressFormValues>
}

export function AddressForm({ control }: AddressFormProps) {
  const t = useTranslations("checkout.address")
  const countryCode = useWatch({ control, name: "country" }) || DEFAULT_COUNTRY_CODE
  const selectedCountry = getCountryByCode(countryCode)
  const dialCode = selectedCountry?.dialCode ?? ""
  const flag = selectedCountry?.flag ?? ""

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-h2 text-ink">{t("title")}</h2>
        <p className="mt-1 text-small text-ink/60">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          name="firstName"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <RequiredFieldLabel icon={User} htmlFor={field.name}>{t("firstName")}</RequiredFieldLabel>
              <Input {...field} id={field.name} placeholder={t("firstNamePlaceholder")} aria-invalid={fieldState.invalid} className="h-10" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="lastName"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <RequiredFieldLabel icon={User} htmlFor={field.name}>{t("lastName")}</RequiredFieldLabel>
              <Input {...field} id={field.name} placeholder={t("lastNamePlaceholder")} aria-invalid={fieldState.invalid} className="h-10" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          name="country"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <RequiredFieldLabel icon={Globe} htmlFor={field.name}>{t("country")}</RequiredFieldLabel>
              <CountryCombobox
                id={field.name}
                value={field.value}
                onChange={field.onChange}
                invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="city"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <RequiredFieldLabel icon={MapPin} htmlFor={field.name}>{t("city")}</RequiredFieldLabel>
              <Input {...field} id={field.name} placeholder={t("cityPlaceholder")} aria-invalid={fieldState.invalid} className="h-10" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Controller
        name="street"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <RequiredFieldLabel icon={Home} htmlFor={field.name}>{t("street")}</RequiredFieldLabel>
            <Input {...field} id={field.name} placeholder={t("streetPlaceholder")} aria-invalid={fieldState.invalid} className="h-10" />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="phone"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <RequiredFieldLabel icon={Phone} htmlFor={field.name}>{t("phone")}</RequiredFieldLabel>
            <div className="flex items-center gap-2">
              <span className="flex h-10 shrink-0 items-center gap-1.5 rounded-md border border-input bg-muted px-2.5 text-body text-ink/70">
                <span aria-hidden>{flag}</span>
                {dialCode}
              </span>
              <Input
                {...field}
                id={field.name}
                type="tel"
                inputMode="tel"
                placeholder={t("phonePlaceholder")}
                aria-invalid={fieldState.invalid}
                className="h-10 flex-1"
              />
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="whatsapp"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name} className="items-center gap-1.5">
              <MessageCircle className="size-4 text-ink/50" />
              {t("whatsapp")}
            </FieldLabel>
            <div className="flex items-center gap-2">
              <span className="flex h-10 shrink-0 items-center gap-1.5 rounded-md border border-input bg-muted px-2.5 text-body text-ink/70">
                <span aria-hidden>{flag}</span>
                {dialCode}
              </span>
              <Input
                {...field}
                id={field.name}
                type="tel"
                inputMode="tel"
                placeholder={t("phonePlaceholder")}
                aria-invalid={fieldState.invalid}
                className="h-10 flex-1"
              />
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </div>
  )
}
