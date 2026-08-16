"use client"

import { Controller, useWatch, type Control } from "react-hook-form"
import { z } from "zod"
import { isValidPhoneNumber, type CountryCode } from "libphonenumber-js"
import { useTranslations } from "next-intl"
import { Store, Truck } from "lucide-react"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { MobileMoneyInstructions } from "./MobileMoneyInstructions"
import { cn } from "@/lib/utils"
import type { OrderPaymentMethod } from "@/types"

const PAYMENT_METHODS: OrderPaymentMethod[] = ["CASH_ON_DELIVERY", "PAYMENT_ON_PICKUP", "MOBILE_PAYMENT"]

/** Pass `useTranslations("validation")` from the calling page. */
type Translate = (key: string) => string

export function createPaymentSchema(countryCode: string, t: Translate) {
  return z
    .object({
      method: z.enum(["MOBILE_PAYMENT", "CASH_ON_DELIVERY", "PAYMENT_ON_PICKUP"]),
      phoneNumber: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.method === "MOBILE_PAYMENT") {
        if (!data.phoneNumber || !isValidPhoneNumber(data.phoneNumber, countryCode as CountryCode)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["phoneNumber"],
            message: t("mobileMoneyInvalid"),
          })
        }
      }
    })
}

export type PaymentFormValues = { method: OrderPaymentMethod; phoneNumber?: string }

interface PaymentFormProps {
  control: Control<PaymentFormValues>
  dialCode: string
  flag?: string
}

export function PaymentForm({ control, dialCode, flag }: PaymentFormProps) {
  const t = useTranslations("checkout.payment")
  const method = useWatch({ control, name: "method" })

  const paymentMethodLabels: Record<OrderPaymentMethod, string> = {
    MOBILE_PAYMENT: t("methods.mobile"),
    CASH_ON_DELIVERY: t("methods.cod"),
    PAYMENT_ON_PICKUP: t("methods.pickup"),
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-h2 text-ink">{t("title")}</h2>

      <Controller
        name="method"
        control={control}
        render={({ field }) => (
          <div role="radiogroup" aria-label={t("ariaLabel")} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {PAYMENT_METHODS.map((option) => {
              const isSelected = field.value === option
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => field.onChange(option)}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-4 py-3 text-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sangria",
                    isSelected
                      ? "border-sangria bg-sangria/5 font-medium text-sangria"
                      : "border-black/10 text-ink hover:bg-gold-light/40"
                  )}
                >
                  {option === "MOBILE_PAYMENT" ? (
                    <span className="flex shrink-0 items-center gap-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/payment-methods/om.png" alt="" className="h-5 w-auto rounded-sm" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/payment-methods/momo.png" alt="" className="h-5 w-auto rounded-sm" />
                    </span>
                  ) : option === "PAYMENT_ON_PICKUP" ? (
                    <Store className="size-4 shrink-0" />
                  ) : (
                    <Truck className="size-4 shrink-0" />
                  )}
                  {paymentMethodLabels[option]}
                </button>
              )
            })}
          </div>
        )}
      />

      {method === "MOBILE_PAYMENT" ? (
        <>
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{t("mobileNumberLabel")}</FieldLabel>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-input bg-muted px-2.5 text-body text-ink/70">
                    {flag && <span aria-hidden>{flag}</span>}
                    {dialCode}
                  </span>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    id={field.name}
                    type="tel"
                    inputMode="tel"
                    placeholder={t("mobileNumberPlaceholder")}
                    aria-invalid={fieldState.invalid}
                    className="flex-1"
                  />
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <MobileMoneyInstructions />
        </>
      ) : (
        <p className="rounded-md border border-black/10 bg-cream p-4 text-body text-ink/70">
          {method === "PAYMENT_ON_PICKUP" ? t("pickupNote") : t("codNote")}
        </p>
      )}
    </div>
  )
}
