"use client"

import { use } from "react"
import { ProductDetailPanel } from "@/components/admin/ProductDetailPanel"

export default function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return <ProductDetailPanel productId={id} mode="page" />
}
