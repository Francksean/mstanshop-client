import { apiClient } from "@/lib/api-client"
import type {
  Order,
  OrderResponse,
  OrderStatus,
  OrderSummary,
  OrderSummaryResponse,
  PagedResponse,
  Pageable,
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

export interface AdminOrdersPage {
  items: OrderSummary[]
  page: number
  totalPages: number
  totalElements: number
}

export interface AdminOrdersQuery extends Pageable {
  status?: OrderStatus
  orderNumber?: string
}

export async function getAllOrders(query: AdminOrdersQuery = {}): Promise<AdminOrdersPage> {
  const page = query.page ?? 0
  const size = query.size ?? 20

  const { data } = await apiClient.get<PagedResponse<OrderSummaryResponse>>("/admin/orders", {
    params: {
      page,
      size,
      sort: query.sort,
      status: query.status,
      orderNumber: query.orderNumber || undefined,
    },
  })
  return {
    items: data.content.map(mapOrderSummaryResponse),
    page: data.page,
    totalPages: data.totalPages,
    totalElements: data.totalElements,
  }
}

export async function getOrderById(id: string): Promise<Order> {
  const { data } = await apiClient.get<OrderResponse>(`/admin/orders/${id}`)
  return mapOrderResponse(data)
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const { data } = await apiClient.patch<OrderResponse>(`/admin/orders/${id}/status`, { status })
  return mapOrderResponse(data)
}

export async function cancelOrderAsAdmin(id: string): Promise<Order> {
  const { data } = await apiClient.post<OrderResponse>(`/admin/orders/${id}/cancel`)
  return mapOrderResponse(data)
}

/** Marks a cash-on-delivery or pay-on-pickup order as collected once payment is received in hand — distinct from "mark delivered". */
export async function confirmCashPayment(id: string): Promise<Order> {
  const { data } = await apiClient.post<OrderResponse>(`/admin/orders/${id}/confirm-cash-payment`)
  return mapOrderResponse(data)
}
