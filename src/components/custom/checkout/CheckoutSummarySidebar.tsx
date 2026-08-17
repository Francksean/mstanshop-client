"use client";

import { useLocale, useTranslations } from "next-intl";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { TrustBadges } from "@/components/custom/TrustBadges";
import { OrderSummaryCard } from "@/components/custom/OrderSummaryCard";
import {
  SHIPPING_COSTS,
  type ShippingMethod,
} from "@/components/custom/ShippingMethodForm";
import { formatPrice } from "@/lib/utils";
import type { PromoPreview } from "@/types";

interface CheckoutSummarySidebarProps {
  step: number;
  subtotal: number;
  shippingMethod: ShippingMethod;
  promoPreview: PromoPreview | null;
  promoCode: string;
  onPromoCodeChange: (value: string) => void;
  onCheckPromo: () => void;
  isCheckingPromo: boolean;
  isSubmitting: boolean;
  onSubmitOrder: () => void;
}

export function CheckoutSummarySidebar({
  step,
  subtotal,
  shippingMethod,
  promoPreview,
  promoCode,
  onPromoCodeChange,
  onCheckPromo,
  isCheckingPromo,
  isSubmitting,
  onSubmitOrder,
}: CheckoutSummarySidebarProps) {
  const locale = useLocale();
  const t = useTranslations("checkout");

  return (
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
              onClick={onSubmitOrder}
            >
              {isSubmitting ? t("summary.submitting") : t("summary.submit")}
            </Button>
          ) : undefined
        }
        promoCodeSlot={
          <Field>
            <FieldLabel htmlFor="promoCode" className="items-center gap-1.5">
              <Tag className="size-4 text-ink/50" />
              {t("summary.promoCodeLabel")}
            </FieldLabel>
            <div className="flex flex-col gap-3">
              <Input
                id="promoCode"
                value={promoCode}
                onChange={(e) => onPromoCodeChange(e.target.value)}
                placeholder={t("summary.promoCodePlaceholder")}
                className="h-11 min-w-0"
              />
              <Button
                type="button"
                className="h-11 w-full border-transparent bg-gold text-white hover:bg-gold-hover"
                onClick={onCheckPromo}
                disabled={!promoCode.trim() || isCheckingPromo}
              >
                {isCheckingPromo ? t("summary.verifying") : t("summary.verify")}
              </Button>
            </div>
            {promoPreview &&
              (promoPreview.valid ? (
                <p className="text-small text-delivered">
                  {t("summary.promoApplied", {
                    amount: formatPrice(promoPreview.discountAmount, locale),
                  })}
                </p>
              ) : (
                <p className="text-small text-sangria">{promoPreview.reason}</p>
              ))}
          </Field>
        }
      />
      <TrustBadges variant="inline" className="mt-6 justify-start" />
    </div>
  );
}
