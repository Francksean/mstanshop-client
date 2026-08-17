"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import Link from "next/link"
import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js"
import { useTranslations } from "next-intl"
import { ArrowLeft } from "lucide-react"
import { CheckoutStepper } from "@/components/custom/CheckoutStepper"
import { AuthGateDialog } from "@/components/custom/checkout/AuthGateDialog"
import { OrderConfirmation, type PaymentPhase } from "@/components/custom/checkout/OrderConfirmation"
import { CheckoutMobileSteps } from "@/components/custom/checkout/CheckoutMobileSteps"
import { CheckoutDesktopSteps } from "@/components/custom/checkout/CheckoutDesktopSteps"
import { CheckoutSummarySidebar } from "@/components/custom/checkout/CheckoutSummarySidebar"
import { ScrollToTopButton } from "@/components/custom/ScrollToTopButton"
import { createAddressSchema, type AddressFormValues } from "@/components/custom/AddressForm"
import { createPaymentSchema, isPaymentMethodAvailable, type PaymentFormValues } from "@/components/custom/PaymentForm"
import { type ShippingMethod } from "@/components/custom/ShippingMethodForm"
import { EmptyState } from "@/components/custom/EmptyState"
import { useCart } from "@/hooks/useCart"
import { useAuth } from "@/hooks/useAuth"
import { createGuestOrder, createOrder, getPaymentStatus } from "@/lib/services/orders.service"
import { getPromoPreview } from "@/lib/services/cart.service"
import { normalizeError } from "@/lib/api-error"
import { getCountryByCode, DEFAULT_COUNTRY_CODE } from "@/lib/countries"
import type { Order, PromoPreview } from "@/types"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Backend requires a non-blank postal code on every address, but the storefront
// doesn't collect street-level postal codes — send a neutral placeholder.
const PLACEHOLDER_POSTAL_CODE = "00000"

const POLL_INTERVAL_MS = 4000
const POLL_TIMEOUT_MS = 3 * 60 * 1000

export default function CheckoutPage() {
  const router = useRouter()
  const t = useTranslations("checkout")
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
      <AuthGateDialog
        onLogin={() => router.push("/login?redirect=/checkout")}
        onGuest={() => setGuestMode(true)}
      />
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
    return (
      <OrderConfirmation
        order={confirmedOrder}
        phase={paymentPhase}
        shippingMethod={shippingMethod}
        guestMode={guestMode}
        onRetry={handleRetry}
        onContinue={() => router.push(guestMode ? "/products" : "/account/orders")}
      />
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

      <CheckoutMobileSteps
        step={step}
        onStepChange={setStep}
        addressControl={addressForm.control}
        onSubmitAddress={addressForm.handleSubmit(goToShippingMethod)}
        guestMode={guestMode}
        guestEmail={guestEmail}
        onGuestEmailChange={setGuestEmail}
        shippingMethod={shippingMethod}
        onShippingMethodChange={setShippingMethod}
        onContinueToPayment={() => setStep(3)}
        paymentControl={paymentForm.control}
        dialCode={dialCode}
        flag={selectedCountry?.flag}
      />

      <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-[1fr_360px]">
        <CheckoutDesktopSteps
          step={step}
          addressControl={addressForm.control}
          onSubmitAddress={addressForm.handleSubmit(goToShippingMethod)}
          guestMode={guestMode}
          guestEmail={guestEmail}
          onGuestEmailChange={setGuestEmail}
          shippingMethod={shippingMethod}
          onShippingMethodChange={setShippingMethod}
          onBackToShipping={() => setStep(1)}
          onContinueToPayment={() => setStep(3)}
          onBackToPayment={() => setStep(2)}
          paymentControl={paymentForm.control}
          dialCode={dialCode}
          flag={selectedCountry?.flag}
        />

        <CheckoutSummarySidebar
          step={step}
          subtotal={subtotal}
          shippingMethod={shippingMethod}
          promoPreview={promoPreview}
          promoCode={promoCode}
          onPromoCodeChange={handlePromoCodeChange}
          onCheckPromo={handleCheckPromo}
          isCheckingPromo={isCheckingPromo}
          isSubmitting={isSubmitting}
          onSubmitOrder={() => paymentForm.handleSubmit(handleConfirmOrder)()}
        />
      </div>

      <ScrollToTopButton />
    </div>
  )
}
