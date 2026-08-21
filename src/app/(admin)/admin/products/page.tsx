"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, MoreHorizontal, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable"
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog"
import { CategoryMultiSelect } from "@/components/admin/CategoryMultiSelect"
import { RefreshButton } from "@/components/admin/RefreshButton"
import { ImagePlaceholder } from "@/components/custom/ImagePlaceholder"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAdminProducts } from "@/hooks/admin/useAdminProducts"
import { deleteProduct } from "@/lib/services/admin/products.service"
import { getCategories } from "@/lib/services/categories.service"
import { formatPrice, resolveMediaUrl } from "@/lib/utils"
import { LOW_STOCK_THRESHOLD } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Category, Product } from "@/types"

export default function AdminProductsPage() {
  const router = useRouter()
  const {
    items,
    page,
    totalPages,
    totalElements,
    pageSize,
    isLoading,
    error,
    search,
    categoryIds,
    setSearch,
    setPageSize,
    setCategoryIds,
    setPage,
    refetch,
  } = useAdminProducts()
  const [categories, setCategories] = useState<Category[]>([])
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  function openDetail(product: Product) {
    router.push(`/admin/products/${product.id}`)
  }

  const columns: DataTableColumn<Product>[] = [
    {
      key: "thumbnail",
      header: "",
      className: "w-14",
      mobileVisual: true,
      render: (p) =>
        p.images[0]?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveMediaUrl(p.images[0].url)}
            alt=""
            className="h-10 w-10 rounded-md object-cover"
          />
        ) : (
          <ImagePlaceholder aspectRatio="square" label="" className="h-10 w-10 rounded-md" />
        ),
    },
    {
      key: "name",
      header: "Nom",
      mobileTitle: true,
      sortAccessor: (p) => p.name.toLowerCase(),
      render: (p) => (
        <span className="flex items-center gap-2">
          <span className="font-medium text-ink">{p.name}</span>
          {!p.active && (
            <span className="rounded-full bg-ink/5 px-2 py-0.5 text-small text-ink/60">Inactif</span>
          )}
        </span>
      ),
    },
    { key: "category", header: "Catégorie", render: (p) => p.category },
    { key: "price", header: "Prix", sortAccessor: (p) => p.price, render: (p) => formatPrice(p.price) },
    {
      key: "purchasePrice",
      header: "Prix d'achat",
      sortAccessor: (p) => p.purchasePrice ?? -1,
      render: (p) => {
        if (p.purchasePrice === undefined) return <span className="text-ink/40">—</span>
        const margin = p.price > 0 ? Math.round(((p.price - p.purchasePrice) / p.price) * 100) : null
        return (
          <span className="flex flex-col">
            {formatPrice(p.purchasePrice)}
            {margin !== null && <span className="text-small text-ink/40">Marge {margin}%</span>}
          </span>
        )
      },
    },
    {
      key: "stock",
      header: "Stock",
      sortAccessor: (p) => p.stock,
      render: (p) => (
        <span className={cn(p.stock < LOW_STOCK_THRESHOLD && "font-medium text-sangria")}>{p.stock}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-10 text-right",
      mobileAction: true,
      render: (p) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Actions"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => openDetail(p)}>
              <Eye className="size-4" />
              Voir / modifier
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => setDeletingProduct(p)}>
              <Trash2 className="size-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-h2 text-ink">Produits</h1>
          <RefreshButton onRefresh={refetch} isLoading={isLoading} />
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="size-4" />
            Ajouter
          </Link>
        </Button>
      </div>

      {error && <p className="text-body text-sangria">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <CategoryMultiSelect categories={categories} value={categoryIds} onChange={setCategoryIds} />
      </div>

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(p) => p.id}
        isLoading={isLoading}
        emptyTitle="Aucun produit"
        emptyDescription="Ajoutez votre premier produit pour commencer."
        pagination={{
          page,
          totalPages,
          totalElements,
          pageSize,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
        search={{ value: search, onChange: setSearch, placeholder: "Rechercher un produit…" }}
        onRowClick={openDetail}
      />

      <DeleteConfirmDialog
        open={Boolean(deletingProduct)}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        title="Supprimer ce produit ?"
        description={`"${deletingProduct?.name}" sera définitivement supprimé du catalogue.`}
        onConfirm={async () => {
          if (deletingProduct) {
            await deleteProduct(deletingProduct.id)
            refetch()
          }
        }}
      />
    </div>
  )
}
