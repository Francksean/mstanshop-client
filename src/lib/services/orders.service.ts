import { apiClient } from "@/lib/api-client"
import type {
  CreateGuestOrderPayload,
  CreateOrderPayload,
  Order,
  OrderResponse,
  OrderSummary,
  OrderSummaryResponse,
  PagedResponse,
} from "@/types"

function mapOrderResponse(dto: OrderResponse): Order {
  return {
    id: dto.id,
    reference: dto.orderNumber,
    status: dto.status,
    items: dto.items.map((item) => ({
      productId: item.productId,
      name: item.productName,
      productThumbnailUrl: item.productThumbnailUrl,
      variantId: item.variantId,
      variantColorName: item.variantColorName,
      variantColorHex: item.variantColorHex,
      variantSize: item.variantSize,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    total: dto.totalAmount,
    subtotal: dto.subtotalAmount,
    discount: dto.discountAmount,
    promoCode: dto.promoCode,
    paymentMethod: dto.paymentMethod,
    paymentReference: dto.paymentReference,
    paymentStatus: dto.paymentStatus,
    address: dto.address,
    createdAt: dto.createdAt,
    customer: dto.customer,
  }
}

function mapOrderSummaryResponse(dto: OrderSummaryResponse): OrderSummary {
  return {
    id: dto.id,
    reference: dto.orderNumber,
    status: dto.status,
    total: dto.totalAmount,
    createdAt: dto.createdAt,
    customer: dto.customer,
  }
}

export async function getOrders(): Promise<OrderSummary[]> {
  const { data } = await apiClient.get<PagedResponse<OrderSummaryResponse>>("/orders", {
    params: { page: 0, size: 50 },
  })
  return data.content.map(mapOrderSummaryResponse)
}

export async function getOrderById(id: string): Promise<Order> {
  const { data } = await apiClient.get<OrderResponse>(`/orders/${id}`)
  return mapOrderResponse(data)
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await apiClient.post<OrderResponse>("/orders", {
    address: {
      firstName: payload.address.firstName,
      lastName: payload.address.lastName,
      street: payload.address.street,
      city: payload.address.city,
      postalCode: payload.address.postalCode,
      country: payload.address.country,
      phone: payload.address.phone,
      whatsapp: payload.address.whatsapp,
    },
    paymentMethod: payload.paymentMethod,
    phoneNumber: payload.phoneNumber,
    promoCode: payload.promoCode || undefined,
  })
  return mapOrderResponse(data)
}

export async function createGuestOrder(payload: CreateGuestOrderPayload): Promise<Order> {
  const { data } = await apiClient.post<OrderResponse>("/guest/orders", {
    address: {
      firstName: payload.address.firstName,
      lastName: payload.address.lastName,
      street: payload.address.street,
      city: payload.address.city,
      postalCode: payload.address.postalCode,
      country: payload.address.country,
      phone: payload.address.phone,
      whatsapp: payload.address.whatsapp,
    },
    email: payload.email || null,
    paymentMethod: payload.paymentMethod,
    phoneNumber: payload.phoneNumber,
    promoCode: payload.promoCode || undefined,
    items: payload.items,
  })
  return mapOrderResponse(data)
}

export async function cancelOrder(id: string): Promise<Order> {
  const { data } = await apiClient.post<OrderResponse>(`/orders/${id}/cancel`)
  return mapOrderResponse(data)
}

/** Polled after order creation while `paymentStatus === "PENDING"` — re-checks the real CamPay status, not just the local DB. */
export async function getPaymentStatus(id: string): Promise<Order> {
  const { data } = await apiClient.get<OrderResponse>(`/orders/${id}/payment-status`)
  return mapOrderResponse(data)
}
