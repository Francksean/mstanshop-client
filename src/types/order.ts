export type OrderStatus =
  | "EN_ATTENTE"
  | "PAYEE"
  | "EXPEDIEE"
  | "LIVREE"
  | "ANNULEE"
  | "ECHEC_PAIEMENT"

export type PaymentStatus = "PENDING" | "SUCCESSFUL" | "FAILED"

export interface OrderCustomer {
  /** Null fields identify a guest order (no account attached). */
  id: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
}

export interface OrderItem {
  productId: string
  name: string
  productThumbnailUrl?: string
  variantId?: string
  variantColorName?: string
  variantColorHex?: string
  variantSize?: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface OrderAddress {
  firstName?: string
  lastName?: string
  street: string
  city: string
  postalCode: string
  country: string
  phone: string
  whatsapp?: string
}

export type OrderPaymentMethod = "MOBILE_PAYMENT" | "CASH_ON_DELIVERY" | "PAYMENT_ON_PICKUP"

export interface Order {
  id: string
  reference: string
  status: OrderStatus
  paymentMethod?: OrderPaymentMethod
  paymentReference?: string
  paymentStatus?: PaymentStatus
  items: OrderItem[]
  total: number
  subtotal: number
  discount: number | null
  promoCode: string | null
  address: OrderAddress
  createdAt: string
  customer?: OrderCustomer
}

export interface CreateOrderPayload {
  address: OrderAddress & { firstName: string; lastName: string; whatsapp?: string }
  paymentMethod: OrderPaymentMethod
  /** Mobile Money number to debit (MTN/Orange), with country dial code — required when `paymentMethod` is "MOBILE_PAYMENT". */
  phoneNumber?: string
  promoCode?: string
}

export interface GuestOrderItem {
  productId: string
  variantId?: string
  quantity: number
}

/** `POST /api/guest/orders` — same as `CreateOrderPayload` but items are sent directly (no server-side cart) and email is optional. */
export interface CreateGuestOrderPayload {
  address: OrderAddress & { firstName: string; lastName: string; whatsapp?: string }
  email?: string | null
  paymentMethod: OrderPaymentMethod
  phoneNumber?: string
  promoCode?: string
  items: GuestOrderItem[]
}

/** Backend `OrderItemResponse`/`AddressResponse`/`OrderResponse`. */
export interface OrderItemResponse {
  productId: string
  productName: string
  /** Snapshot of the product's thumbnail at order time — stays fixed even if the product's photos change later. */
  productThumbnailUrl?: string
  variantId?: string
  variantColorName?: string
  variantColorHex?: string
  variantSize?: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface AddressResponse {
  firstName?: string
  lastName?: string
  street: string
  city: string
  postalCode: string
  country: string
  phone: string
  whatsapp?: string
}

export interface OrderResponse {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentMethod?: OrderPaymentMethod
  paymentReference?: string
  paymentStatus?: PaymentStatus
  customer?: OrderCustomer
  totalAmount: number
  subtotalAmount: number
  discountAmount: number | null
  promoCode: string | null
  address: AddressResponse
  items: OrderItemResponse[]
  createdAt: string
}

/** Backend `OrderSummaryResponse` — the shape `GET /orders` and `GET /admin/orders` actually return (list view, no items/address). */
export interface OrderSummaryResponse {
  id: string
  orderNumber: string
  status: OrderStatus
  customer?: OrderCustomer
  totalAmount: number
  createdAt: string
}

/** Client-side list-row shape — mirrors `OrderSummaryResponse`; use `getOrderById` for the full `Order`. */
export interface OrderSummary {
  id: string
  reference: string
  status: OrderStatus
  total: number
  createdAt: string
  customer?: OrderCustomer
}
