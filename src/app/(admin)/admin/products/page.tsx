"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Plus, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable"
import { ProductFormDialog } from "@/components/admin/ProductFormDialog"
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog"
import { ProductDetailSheet } from "@/components/admin/ProductDetailSheet"
import { CategoryMultiSelect } from "@/components/admin/CategoryMultiSelect"
import { ImagePlaceholder } from "@/components/custom/ImagePlaceholder"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAdminProducts } from "@/hooks/admin/useAdminProducts"
import { deleteProduct } from "@/lib/services/admin/products.service"
import { getProductById } from "@/lib/services/products.service"
import { getCategories } from "@/lib/services/categories.service"
import { normalizeError } from "@/lib/api-error"
import { formatPrice, resolveMediaUrl } from "@/lib/utils"
import { LOW_STOCK_THRESHOLD } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Category, Product } from "@/types"

export default function AdminProductsPage() {
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
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isLoadingEdit, setIsLoadingEdit] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [viewingProductId, setViewingProductId] = useState<string | null>(null)

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  function openCreate() {
    setEditingProduct(null)
    setFormOpen(true)
  }

  async function openEdit(product: Product) {
    // The products list endpoint doesn't return `categoryId` (only the
    // category name) — fetch the full detail so the form's category select
    // has a real default value instead of falling back to empty.
    setIsLoadingEdit(true)
    try {
      const detail = await getProductById(product.id)
      setEditingProduct(detail ?? product)
      setFormOpen(true)
    } catch (err) {
      toast.error(normalizeError(err).message)
    } finally {
      setIsLoadingEdit(false)
    }
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
            <DropdownMenuItem onSelect={() => setViewingProductId(p.id)}>
              <Eye className="size-4" />
              Voir les détails
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isLoadingEdit} onSelect={() => openEdit(p)}>
              <Pencil className="size-4" />
              Modifier
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
        <h1 className="text-h2 text-ink">Produits</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Ajouter
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
        onRowClick={(p) => setViewingProductId(p.id)}
      />

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        onSaved={refetch}
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

      <ProductDetailSheet
        open={Boolean(viewingProductId)}
        onOpenChange={(open) => !open && setViewingProductId(null)}
        productId={viewingProductId}
      />
    </div>
  )
}
