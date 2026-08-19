export type WhatsAppTemplateCategory = "MARKETING" | "UTILITY" | "AUTHENTICATION"
export type WhatsAppTemplateStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAUSED"
export type WhatsAppTemplateEventCode = "ORDER_CONFIRMATION" | "PAYMENT_FAILED" | "ORDER_CANCELLATION"

export interface WhatsAppTemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER"
  text: string
}

export interface WhatsAppTemplate {
  id: string
  genukaTemplateId: string
  name: string
  language: string
  category: WhatsAppTemplateCategory
  eventCode: WhatsAppTemplateEventCode | null
  components: WhatsAppTemplateComponent[]
  status: WhatsAppTemplateStatus
  createdAt: string
  updatedAt: string
}

export interface WhatsAppTemplateRequest {
  name: string
  language?: string
  category?: WhatsAppTemplateCategory
  eventCode?: WhatsAppTemplateEventCode | null
  components: WhatsAppTemplateComponent[]
}
