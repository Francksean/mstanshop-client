"use client"

import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ProductDetailPanel } from "@/components/admin/ProductDetailPanel"

interface ProductDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string | null
  onSaved?: () => void
}

export function ProductDetailSheet({ open, onOpenChange, productId, onSaved }: ProductDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        {productId && <ProductDetailPanel productId={productId} mode="sheet" onSaved={onSaved} />}
      </SheetContent>
    </Sheet>
  )
}
