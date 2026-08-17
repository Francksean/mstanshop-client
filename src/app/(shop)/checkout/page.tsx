"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import Link from "next/link"
import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js"
import { useLocale, useTranslations } from "next-intl"
import { ArrowLeft, ArrowRight, Check, Loader2, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckoutStepper } from "@/components/custom/CheckoutStepper"
import { TrustBadges } from "@/components/custom/TrustBadges"
import { AddressForm, createAddressSchema, type AddressFormValues } from "@/components/custom/AddressForm"
import { PaymentForm, createPaymentSchema, isPaymentMethodAvailable, type PaymentFormValues } from "@/components/custom/PaymentForm"
import { ShippingMethodForm, SHIPPING_COSTS, type ShippingMethod } from "@/components/custom/ShippingMethodForm"
import { OrderSummaryCard } from "@/components/custom/OrderSummaryCard"
import { EmptyState } from "@/components/custom/EmptyState"
import { useCart } from "@/hooks/useCart"
import { useAuth } from "@/hooks/useAuth"
import { createGuestOrder, createOrder, getPaymentStatus } from "@/lib/services/orders.service"
import { getPromoPreview } from "@/lib/services/cart.service"
import { normalizeError } from "@/lib/api-error"
import { getCountryByCode, DEFAULT_COUNTRY_CODE } from "@/lib/countries"
import { cn, formatPrice } from "@/lib/utils"
import type { Order, PromoPreview } from "@/types"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Backend requires a non-blank postal code on every address, but the storefront
// doesn't collect street-level postal codes — send a neutral placeholder.
const PLACEHOLDER_POSTAL_CODE = "00000"

const POLL_INTERVAL_MS = 4000
const POLL_TIMEOUT_MS = 3 * 60 * 1000

type PaymentPhase = "pending" | "success" | "failed" | "timeout"

function AccordionStepLabel({ n, currentStep, label }: { n: number; currentStep: number; label: string }) {
  const isDone = n < currentStep
  const isActive = n === currentStep
  return (
    <span className="flex items-center gap-3">
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium",
          isDone && "border-sangria text-sangria",
          isActive && "border-sangria bg-sangria text-white",
          !isDone && !isActive && "border-black/20 text-ink/40"
        )}
      >
        {isDone ? <Check className="h-3.5 w-3.5" /> : n}
      </span>
      <span className={isActive ? "font-medium text-ink" : "text-ink/70"}>{label}</span>
    </span>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations("checkout")
  const tStepper = useTranslations("checkout.stepper")
  const tCommon = useTranslations("common.actions")
  const tValidation = useTranslations("validation")
  const tApiErrors = useTranslations("apiErrors")
  const { user, isAuthenticated } = useAuth()
  const { items, subtotal, clearCart } = useCart()
  const [step, setStep] = useState(1)
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("PICKUP")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [promoPreview, setPromoPreview] = useState<PromoPreview | null>(null)
  const [isCheckingPromo, setIsCheckingPromo] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null)
  const [paymentPhase, setPaymentPhase] = useState<PaymentPhase>("pending")
  const [guestMode, setGuestMode] = useState(false)
  const [guestEmail, setGuestEmail] = useState("")

  const canCheckout = isAuthenticated || guestMode

  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(createAddressSchema(tValidation)),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      street: "",
      city: "",
      country: DEFAULT_COUNTRY_CODE,
      phone: "",
      whatsapp: "",
    },
  })
  const addressCountryCode = useWatch({ control: addressForm.control, name: "country" }) || DEFAULT_COUNTRY_CODE

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(createPaymentSchema(addressCountryCode, tValidation)),
    defaultValues: { method: "MOBILE_PAYMENT", phoneNumber: "" },
  })
  const selectedCountry = getCountryByCode(addressCountryCode)
  const dialCode = selectedCountry?.dialCode ?? ""

  // A previously-selected payment method can become unavailable when the customer goes
  // back and switches shipping method (e.g. picked "cash on delivery" then switched to
  // in-store pickup) — fall back to the always-available Mobile Money option.
  useEffect(() => {
    const current = paymentForm.getValues("method")
    if (!isPaymentMethodAvailable(current, shippingMethod)) {
      paymentForm.setValue("method", "MOBILE_PAYMENT")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingMethod])

  // Poll the real payment status while an order sits EN_ATTENTE — the endpoint re-checks
  // CamPay directly, so it's reliable even if the webhook never lands.
  useEffect(() => {
    if (paymentPhase !== "pending" || !confirmedOrder || confirmedOrder.paymentMethod !== "MOBILE_PAYMENT") return
    const startedAt = Date.now()
    let cancelled = false

    const interval = setInterval(async () => {
      if (cancelled) return
      try {
        const updated = await getPaymentStatus(confirmedOrder.id)
        if (cancelled) return
        if (updated.paymentStatus === "SUCCESSFUL" || updated.status === "PAYEE") {
          setConfirmedOrder(updated)
          setPaymentPhase("success")
          await clearCart()
        } else if (updated.paymentStatus === "FAILED" || updated.status === "ECHEC_PAIEMENT") {
          setConfirmedOrder(updated)
          setPaymentPhase("failed")
        } else if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
          setPaymentPhase("timeout")
        }
      } catch {
        if (Date.now() - startedAt > POLL_TIMEOUT_MS) setPaymentPhase("timeout")
      }
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPhase, confirmedOrder?.id, confirmedOrder?.paymentMethod])

  if (!canCheckout) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <Dialog open onOpenChange={() => {}}>
          <DialogContent
            showCloseButton={false}
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="font-heading text-h2">{t("continueDialog.title")}</DialogTitle>
              <DialogDescription>{t("continueDialog.description")}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button size="lg" className="w-full" onClick={() => router.push("/login?redirect=/checkout")}>
                {t("continueDialog.login")}
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={() => setGuestMode(true)}>
                {t("continueDialog.guest")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  if (items.length === 0 && !confirmedOrder) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <EmptyState
          title={t("emptyCart.title")}
          description={t("emptyCart.description")}
          ctaLabel={t("emptyCart.cta")}
          ctaHref="/products"
        />
      </div>
    )
  }

  function goToShippingMethod() {
    if (guestMode && guestEmail.trim() && !EMAIL_PATTERN.test(guestEmail.trim())) {
      toast.error(t("emailInvalid"))
      return
    }
    setStep(2)
  }

  function handlePromoCodeChange(value: string) {
    setPromoCode(value.toUpperCase())
    setPromoPreview(null)
  }

  async function handleCheckPromo() {
    const code = promoCode.trim()
    if (!code) return
    setIsCheckingPromo(true)
    try {
      const preview = await getPromoPreview(code)
      setPromoPreview(preview)
    } catch (error) {
      toast.error(normalizeError(error, tApiErrors).message)
    } finally {
      setIsCheckingPromo(false)
    }
  }

  async function handleConfirmOrder(payment: PaymentFormValues) {
    setIsSubmitting(true)
    try {
      const values = addressForm.getValues()
      const countryCode = values.country as CountryCode
      const formattedPhone =
        parsePhoneNumberFromString(values.phone, countryCode)?.format("E.164") ?? values.phone
      const formattedWhatsapp = values.whatsapp
        ? (parsePhoneNumberFromString(values.whatsapp, countryCode)?.format("E.164") ?? values.whatsapp)
        : undefined
      const address = {
        firstName: values.firstName,
        lastName: values.lastName,
        street: values.street,
        city: values.city,
        postalCode: PLACEHOLDER_POSTAL_CODE,
        country: getCountryByCode(values.country)?.name ?? values.country,
        phone: formattedPhone,
        whatsapp: formattedWhatsapp,
      }

      const skipsOnlinePayment = payment.method !== "MOBILE_PAYMENT"
      const formattedMobileMoneyNumber = skipsOnlinePayment
        ? undefined
        : (parsePhoneNumberFromString(payment.phoneNumber ?? "", countryCode)?.format("E.164") ??
          payment.phoneNumber)

      const order = isAuthenticated
        ? await createOrder({
            address,
            paymentMethod: payment.method,
            phoneNumber: formattedMobileMoneyNumber,
            promoCode: promoCode.trim() || undefined,
          })
        : await createGuestOrder({
            address,
            email: guestEmail.trim() || null,
            paymentMethod: payment.method,
            phoneNumber: formattedMobileMoneyNumber,
            promoCode: promoCode.trim() || undefined,
            items: items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
            })),
          })

      setConfirmedOrder(order)
      setStep(4)

      if (skipsOnlinePayment) {
        setPaymentPhase("success")
        await clearCart()
      } else {
        setPaymentPhase("pending")
      }
    } catch (error) {
      toast.error(normalizeError(error, tApiErrors).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleRetry() {
    setConfirmedOrder(null)
    setPaymentPhase("pending")
    setStep(3)
  }

  if (step === 4 && confirmedOrder) {
    if (paymentPhase === "pending" || paymentPhase === "timeout") {
      return (
        <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-8">
          <CheckoutStepper currentStep={4} />
          <Loader2 className="mx-auto mt-8 size-10 animate-spin text-sangria" />
          <h1 className="mt-6 text-h1 text-ink">{t("paymentPending.title")}</h1>
          <p className="mt-4 text-body text-ink/70">
            {t.rich("paymentPending.body", {
              phone: () => <span className="font-medium text-ink">{confirmedOrder.address.phone}</span>,
              reference: () => <span className="font-medium text-ink">#{confirmedOrder.reference}</span>,
            })}
          </p>
          {paymentPhase === "timeout" && (
            <p className="mt-4 rounded-md bg-gold-light/40 p-4 text-small text-ink/70">
              {t("paymentPending.timeoutNote")}
            </p>
          )}
        </div>
      )
    }

    if (paymentPhase === "failed") {
      return (
        <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-8">
          <CheckoutStepper currentStep={4} />
          <TriangleAlert className="mx-auto mt-8 size-10 text-sangria" />
          <h1 className="mt-6 text-h1 text-ink">{t("paymentFailed.title")}</h1>
          <p className="mt-4 text-body text-ink/70">
            {t.rich("paymentFailed.body", {
              reference: () => <span className="font-medium text-ink">#{confirmedOrder.reference}</span>,
            })}
          </p>
          <Button className="mt-8" onClick={handleRetry}>
            {tCommon("retry")}
          </Button>
        </div>
      )
    }

    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-8">
        <CheckoutStepper currentStep={4} />
        <h1 className="mt-8 text-h1 text-ink">{t("success.title")}</h1>
        <p className="mt-4 text-body text-ink/70">
          {t.rich("success.body", {
            reference: () => <span className="font-medium text-ink">#{confirmedOrder.reference}</span>,
          })}{" "}
          {confirmedOrder.paymentMethod === "CASH_ON_DELIVERY"
            ? t("success.codNote")
            : confirmedOrder.paymentMethod === "PAYMENT_ON_PICKUP"
              ? t("success.pickupNote")
              : t("success.onlineNote")}
        </p>
        <div className="mt-8 text-left">
          <OrderSummaryCard
            subtotal={confirmedOrder.subtotal}
            shipping={SHIPPING_COSTS[shippingMethod]}
            discount={confirmedOrder.discount}
            promoCode={confirmedOrder.promoCode}
          />
        </div>
        <Button
          className="mt-8"
          onClick={() => router.push(guestMode ? "/products" : "/account/orders")}
        >
          {guestMode ? t("success.ctaGuest") : t("success.ctaAccount")}
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1.5 text-small text-ink/60 transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        {t("backToCart")}
      </Link>

      <div className="mt-4 hidden md:block">
        <CheckoutStepper currentStep={step} />
      </div>

      <div className="mt-4 md:hidden">
        <Accordion
          type="single"
          value={String(step)}
          onValueChange={(v) => {
            const n = Number(v)
            if (v && n <= step) setStep(n)
          }}
        >
          <AccordionItem value="1">
            <AccordionTrigger>
              <AccordionStepLabel n={1} currentStep={step} label={tStepper("delivery")} />
            </AccordionTrigger>
            <AccordionContent>
              <form onSubmit={addressForm.handleSubmit(goToShippingMethod)} className="flex flex-col gap-6">
                <AddressForm control={addressForm.control} />
                {guestMode && (
                  <Field>
                    <FieldLabel htmlFor="guestEmailMobile">{t("guestEmailLabel")}</FieldLabel>
                    <Input
                      id="guestEmailMobile"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder={t("guestEmailPlaceholder")}
                      className="h-10"
                    />
                    <p className="text-small text-ink/50">{t("guestEmailHint")}</p>
                  </Field>
                )}
                <Button type="submit" size="lg" className="h-14 w-full gap-2 text-body">
                  {t("continueButton")}
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="2" disabled={step < 2}>
            <AccordionTrigger>
              <AccordionStepLabel n={2} currentStep={step} label={tStepper("shippingMethod")} />
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-6">
                <ShippingMethodForm value={shippingMethod} onChange={setShippingMethod} />
                <Button type="button" size="lg" className="h-14 w-full gap-2 text-body" onClick={() => setStep(3)}>
                  {t("continueToPayment")}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="3" disabled={step < 3}>
            <AccordionTrigger>
              <AccordionStepLabel n={3} currentStep={step} label={tStepper("paymentMethod")} />
            </AccordionTrigger>
            <AccordionContent>
              <PaymentForm
                control={paymentForm.control}
                dialCode={dialCode}
                flag={selectedCountry?.flag}
                shippingMethod={shippingMethod}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-[1fr_360px]">
        <div className="hidden flex-col gap-8 md:flex">
          {step === 1 && (
            <form onSubmit={addressForm.handleSubmit(goToShippingMethod)} className="flex flex-col gap-8">
              <AddressForm control={addressForm.control} />
              {guestMode && (
                <Field>
                  <FieldLabel htmlFor="guestEmail">{t("guestEmailLabel")}</FieldLabel>
                  <Input
                    id="guestEmail"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder={t("guestEmailPlaceholder")}
                  />
                  <p className="text-small text-ink/50">{t("guestEmailHint")}</p>
                </Field>
              )}
              <Button type="submit" size="lg" className="w-full gap-2 sm:w-auto sm:self-start">
                {t("continueButton")}
                <ArrowRight className="size-4" />
              </Button>
            </form>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-8">
              <ShippingMethodForm value={shippingMethod} onChange={setShippingMethod} />
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full gap-2 sm:w-auto"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="size-4" />
                  {t("backToShipping")}
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="w-full gap-2 sm:w-auto"
                  onClick={() => setStep(3)}
                >
                  {t("continueToPayment")}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-8">
              <PaymentForm
                control={paymentForm.control}
                dialCode={dialCode}
                flag={selectedCountry?.flag}
                shippingMethod={shippingMethod}
              />
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full gap-2 sm:w-auto sm:self-start"
                onClick={() => setStep(2)}
              >
                <ArrowLeft className="size-4" />
                {t("backToPayment")}
              </Button>
            </div>
          )}
        </div>

        <div className="md:sticky md:top-24 md:self-start">
          <OrderSummaryCard
            subtotal={promoPreview?.valid ? promoPreview.subtotal : subtotal}
            shipping={step === 1 ? 0 : SHIPPING_COSTS[shippingMethod]}
            shippingPending={step === 1}
            discount={promoPreview?.valid ? promoPreview.discountAmount : undefined}
            promoCode={promoPreview?.valid ? promoPreview.code : undefined}
            action={
              step === 3 ? (
                <Button
                  size="lg"
                  className="mt-2 w-full"
                  disabled={isSubmitting}
                  onClick={() => paymentForm.handleSubmit(handleConfirmOrder)()}
                >
                  {isSubmitting ? t("summary.submitting") : t("summary.submit")}
                </Button>
              ) : undefined
            }
            promoCodeSlot={
              <Field>
                <FieldLabel htmlFor="promoCode">{t("summary.promoCodeLabel")}</FieldLabel>
                <div className="flex flex-nowrap gap-2">
                  <Input
                    id="promoCode"
                    value={promoCode}
                    onChange={(e) => handlePromoCodeChange(e.target.value)}
                    placeholder={t("summary.promoCodePlaceholder")}
                    className="h-11 min-w-0 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 shrink-0"
                    onClick={handleCheckPromo}
                    disabled={!promoCode.trim() || isCheckingPromo}
                  >
                    {isCheckingPromo ? t("summary.verifying") : t("summary.verify")}
                  </Button>
                </div>
                {promoPreview &&
                  (promoPreview.valid ? (
                    <p className="text-small text-delivered">
                      {t("summary.promoApplied", { amount: formatPrice(promoPreview.discountAmount, locale) })}
                    </p>
                  ) : (
                    <p className="text-small text-sangria">{promoPreview.reason}</p>
                  ))}
              </Field>
            }
          />
          <TrustBadges variant="inline" className="mt-6 justify-start" />
        </div>
      </div>
    </div>
  )
}
