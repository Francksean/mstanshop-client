export interface Review {
  id: string
  productId: string
  userId: string
  userFirstName: string
  rating: number
  comment?: string
  createdAt: string
}

export interface CreateReviewPayload {
  rating: number
  comment?: string
}
