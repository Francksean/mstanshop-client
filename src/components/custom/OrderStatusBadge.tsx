"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/types"

// Kept French-labeled and exported as-is — the admin panel (src/components/admin/OrderStatusSelect.tsx,
// src/app/(admin)/admin/orders/page.tsx) reads STATUS_CONFIG[status].label/.className directly and
// stays French-only, out of scope for i18n. The storefront-facing badge below translates its own label.
export const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  EN_ATTENTE: { label: "En attente", className: "bg-ink/5 text-ink/70" },
  PAYEE: { label: "Payée", className: "bg-gold-light text-ink" },
  EXPEDIEE: { label: "Expédiée", className: "bg-sangria/10 text-sangria" },
  LIVREE: { label: "Livrée", className: "bg-delivered-light text-delivered" },
  ANNULEE: { label: "Annulée", className: "bg-sangria-dark/10 text-sangria-dark" },
  ECHEC_PAIEMENT: { label: "Paiement échoué", className: "bg-sangria-dark/10 text-sangria-dark" },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations("account.statuses")

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-small font-medium",
        STATUS_CONFIG[status].className
      )}
    >
      {t(status)}
    </span>
  )
}
