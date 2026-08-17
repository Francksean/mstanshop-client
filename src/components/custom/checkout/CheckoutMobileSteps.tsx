"use client";

import type { Control } from "react-hook-form";
import { useTranslations } from "next-intl";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AccordionStepLabel } from "@/components/custom/checkout/AccordionStepLabel";
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

interface CheckoutMobileStepsProps {
  step: number;
  onStepChange: (step: number) => void;
  addressControl: Control<AddressFormValues>;
  onSubmitAddress: () => void;
  guestMode: boolean;
  guestEmail: string;
  onGuestEmailChange: (value: string) => void;
  shippingMethod: ShippingMethod;
  onShippingMethodChange: (method: ShippingMethod) => void;
  onContinueToPayment: () => void;
  paymentControl: Control<PaymentFormValues>;
  dialCode: string;
  flag?: string;
}

export function CheckoutMobileSteps({
  step,
  onStepChange,
  addressControl,
  onSubmitAddress,
  guestMode,
  guestEmail,
  onGuestEmailChange,
  shippingMethod,
  onShippingMethodChange,
  onContinueToPayment,
  paymentControl,
  dialCode,
  flag,
}: CheckoutMobileStepsProps) {
  const t = useTranslations("checkout");
  const tStepper = useTranslations("checkout.stepper");

  return (
    <div className="mt-4 md:hidden">
      <Accordion
        type="single"
        value={String(step)}
        onValueChange={(v) => {
          const n = Number(v);
          if (v && n <= step) onStepChange(n);
        }}
      >
        <AccordionItem value="1">
          <AccordionTrigger>
            <AccordionStepLabel
              n={1}
              currentStep={step}
              label={tStepper("delivery")}
            />
          </AccordionTrigger>
          <AccordionContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmitAddress();
              }}
              className="flex flex-col gap-6"
            >
              <AddressForm control={addressControl} />
              {guestMode && (
                <Field>
                  <FieldLabel htmlFor="guestEmailMobile" className="items-center gap-1.5">
                    <Mail className="size-4 text-ink/50" />
                    {t("guestEmailLabel")}
                  </FieldLabel>
                  <Input
                    id="guestEmailMobile"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => onGuestEmailChange(e.target.value)}
                    placeholder={t("guestEmailPlaceholder")}
                    className="h-10"
                  />
                  <p className="text-small text-ink/50">
                    {t("guestEmailHint")}
                  </p>
                </Field>
              )}
              <Button
                type="submit"
                size="lg"
                className="h-14 w-full text-white gap-2 text-body"
              >
                {t("continueButton")}
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="2" disabled={step < 2}>
          <AccordionTrigger>
            <AccordionStepLabel
              n={2}
              currentStep={step}
              label={tStepper("shippingMethod")}
            />
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-6">
              <ShippingMethodForm
                value={shippingMethod}
                onChange={onShippingMethodChange}
              />
              <Button
                type="button"
                size="lg"
                className="h-14 w-full text-white gap-2 text-body"
                onClick={onContinueToPayment}
              >
                {t("continueToPayment")}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="3" disabled={step < 3}>
          <AccordionTrigger>
            <AccordionStepLabel
              n={3}
              currentStep={step}
              label={tStepper("paymentMethod")}
            />
          </AccordionTrigger>
          <AccordionContent>
            <PaymentForm
              control={paymentControl}
              dialCode={dialCode}
              flag={flag}
              shippingMethod={shippingMethod}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
