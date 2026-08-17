"use client";

import type { Control } from "react-hook-form";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  AddressForm,
  type AddressFormValues,
} from "@/components/custom/AddressForm";
import {
  PaymentForm,
  type PaymentFormValues,
} from "@/components/custom/PaymentForm";
import {
  ShippingMethodForm,
  type ShippingMethod,
} from "@/components/custom/ShippingMethodForm";

interface CheckoutDesktopStepsProps {
  step: number;
  addressControl: Control<AddressFormValues>;
  onSubmitAddress: () => void;
  guestMode: boolean;
  guestEmail: string;
  onGuestEmailChange: (value: string) => void;
  shippingMethod: ShippingMethod;
  onShippingMethodChange: (method: ShippingMethod) => void;
  onBackToShipping: () => void;
  onContinueToPayment: () => void;
  onBackToPayment: () => void;
  paymentControl: Control<PaymentFormValues>;
  dialCode: string;
  flag?: string;
}

export function CheckoutDesktopSteps({
  step,
  addressControl,
  onSubmitAddress,
  guestMode,
  guestEmail,
  onGuestEmailChange,
  shippingMethod,
  onShippingMethodChange,
  onBackToShipping,
  onContinueToPayment,
  onBackToPayment,
  paymentControl,
  dialCode,
  flag,
}: CheckoutDesktopStepsProps) {
  const t = useTranslations("checkout");

  return (
    <div className="hidden flex-col gap-8 md:flex">
      {step === 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitAddress();
          }}
          className="flex flex-col gap-8"
        >
          <AddressForm control={addressControl} />
          {guestMode && (
            <Field>
              <FieldLabel htmlFor="guestEmail" className="items-center gap-1.5">
                <Mail className="size-4 text-ink/50" />
                {t("guestEmailLabel")}
              </FieldLabel>
              <Input
                id="guestEmail"
                type="email"
                value={guestEmail}
                onChange={(e) => onGuestEmailChange(e.target.value)}
                placeholder={t("guestEmailPlaceholder")}
              />
              <p className="text-small text-ink/50">{t("guestEmailHint")}</p>
            </Field>
          )}
          <Button
            type="submit"
            size="lg"
            className="w-full text-white gap-2 sm:w-auto sm:self-start"
          >
            {t("continueButton")}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-8">
          <ShippingMethodForm
            value={shippingMethod}
            onChange={onShippingMethodChange}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full gap-2 sm:w-auto"
              onClick={onBackToShipping}
            >
              <ArrowLeft className="size-4" />
              {t("backToShipping")}
            </Button>
            <Button
              type="button"
              size="lg"
              className="w-full text-white gap-2 sm:w-auto"
              onClick={onContinueToPayment}
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
            control={paymentControl}
            dialCode={dialCode}
            flag={flag}
            shippingMethod={shippingMethod}
          />
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full gap-2 sm:w-auto sm:self-start"
            onClick={onBackToPayment}
          >
            <ArrowLeft className="size-4" />
            {t("backToPayment")}
          </Button>
        </div>
      )}
    </div>
  );
}
