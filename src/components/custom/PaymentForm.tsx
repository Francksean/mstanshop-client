"use client"

import { Controller, useWatch, type Control } from "react-hook-form"
import { z } from "zod"
import { isValidPhoneNumber, type CountryCode } from "libphonenumber-js"
import { useTranslations } from "next-intl"
import { Store, Truck, Phone } from "lucide-react"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { MobileMoneyInstructions } from "./MobileMoneyInstructions"
import type { ShippingMethod } from "./ShippingMethodForm"
import { cn } from "@/lib/utils"
import type { OrderPaymentMethod } from "@/types"

const PAYMENT_METHODS: OrderPaymentMethod[] = ["CASH_ON_DELIVERY", "PAYMENT_ON_PICKUP", "MOBILE_PAYMENT"]

/** A pickup order has no courier, so "cash on delivery" doesn't apply — and a home-delivery
 *  order never has the customer walk into the store, so "pay on pickup" doesn't apply either. */
export function isPaymentMethodAvailable(method: OrderPaymentMethod, shippingMethod: ShippingMethod): boolean {
  if (shippingMethod === "PICKUP" && method === "CASH_ON_DELIVERY") return false
  if (shippingMethod === "HOME_DELIVERY" && method === "PAYMENT_ON_PICKUP") return false
  return true
}

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
  shippingMethod: ShippingMethod
}

export function PaymentForm({ control, dialCode, flag, shippingMethod }: PaymentFormProps) {
  const t = useTranslations("checkout.payment")
  const method = useWatch({ control, name: "method" })
  const availableMethods = PAYMENT_METHODS.filter((m) => isPaymentMethodAvailable(m, shippingMethod))

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
          <div role="radiogroup" aria-label={t("ariaLabel")} className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2">
            {availableMethods.map((option) => {
              const isSelected = field.value === option
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => field.onChange(option)}
                  className={cn(
                    "flex h-full flex-col items-center justify-center gap-2 rounded-md border px-4 py-4 text-center text-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sangria",
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
                <FieldLabel htmlFor={field.name} className="items-center gap-1.5">
                  <Phone className="size-4 text-ink/50" />
                  {t("mobileNumberLabel")}
                  <span className="text-sangria">*</span>
                </FieldLabel>
                <div className="flex items-center gap-2">
                  <span className="flex h-10 shrink-0 items-center gap-1.5 rounded-md border border-input bg-muted px-2.5 text-body text-ink/70">
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
                    className="h-10 flex-1"
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
