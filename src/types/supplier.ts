export interface Supplier {
  id: string
  name: string
  primaryPhone: string
  secondaryPhone?: string | null
  location?: string | null
}

export interface SupplierRequest {
  name: string
  primaryPhone: string
  secondaryPhone?: string
  location?: string
}
