export interface ApiError {
  message: string
  status?: number
  fieldErrors?: Record<string, string[]>
  raw?: unknown
}

export interface PaginatedResult<T> {
  items: T[]
  page: number
  limit: number
  total: number
  hasMore: boolean
}

/** Query shape for backend endpoints that accept a Spring `Pageable`. */
export interface Pageable {
  page?: number
  size?: number
  sort?: string[]
}

/** Backend paging envelope (`PagedResponse<T>` in the OpenAPI spec). */
export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}
