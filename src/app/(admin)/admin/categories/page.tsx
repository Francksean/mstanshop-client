"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable"
import { CategoryFormDialog } from "@/components/admin/CategoryFormDialog"
import { CategoryPromotionDialog } from "@/components/admin/CategoryPromotionDialog"
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog"
import { useAdminCategories, type CategoryWithCount } from "@/hooks/admin/useAdminCategories"
import { useClientPagination } from "@/hooks/useClientPagination"
import { deleteCategory } from "@/lib/services/admin/categories.service"

export default function AdminCategoriesPage() {
  const { items, isLoading, error, refetch } = useAdminCategories()
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithCount | null>(null)
  const [promotingCategory, setPromotingCategory] = useState<CategoryWithCount | null>(null)
  const [search, setSearch] = useState("")

  function openCreate() {
    setEditingCategory(null)
    setFormOpen(true)
  }

  const filteredItems = items.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  const { pageItems, page, totalPages, totalElements, pageSize, setPage, setPageSize } =
    useClientPagination(filteredItems)

  const columns: DataTableColumn<CategoryWithCount>[] = [
    { key: "name", header: "Nom", sortAccessor: (c) => c.name.toLowerCase(), render: (c) => <span className="font-medium text-ink">{c.name}</span> },
    { key: "slug", header: "Slug", render: (c) => <span className="text-ink/60">{c.slug}</span> },
    { key: "count", header: "Nb produits", sortAccessor: (c) => c.productCount, render: (c) => c.productCount },
    {
      key: "promo",
      header: "Promotion",
      render: (c) =>
        c.promoActive ? (
          <span className="rounded-full bg-sangria/10 px-2 py-0.5 text-small font-medium text-sangria">
            -{c.promoDiscountValue}
            {c.promoDiscountType === "PERCENTAGE" ? "%" : " XAF"}
          </span>
        ) : (
          <span className="text-ink/40">—</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (c) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Promotion"
            onClick={() => setPromotingCategory(c)}
          >
            <Tag className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Modifier"
            onClick={() => {
              setEditingCategory(c)
              setFormOpen(true)
            }}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Supprimer"
            onClick={() => setDeletingCategory(c)}
          >
            <Trash2 className="size-3.5 text-sangria" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-h2 text-ink">Catégories</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Ajouter
        </Button>
      </div>

      {error && <p className="text-body text-sangria">{error}</p>}

      <DataTable
        columns={columns}
        rows={pageItems}
        rowKey={(c) => c.id ?? c.slug}
        isLoading={isLoading}
        emptyTitle="Aucune catégorie"
        emptyDescription="Ajoutez votre première catégorie pour commencer."
        search={{ value: search, onChange: setSearch, placeholder: "Rechercher une catégorie…" }}
        pagination={{ page, totalPages, totalElements, pageSize, onPageChange: setPage, onPageSizeChange: setPageSize }}
      />

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editingCategory}
        onSaved={refetch}
      />

      <CategoryPromotionDialog
        open={Boolean(promotingCategory)}
        onOpenChange={(open) => !open && setPromotingCategory(null)}
        category={promotingCategory}
        onSaved={refetch}
      />

      <DeleteConfirmDialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        title="Supprimer cette catégorie ?"
        description={`"${deletingCategory?.name}" sera définitivement supprimée.`}
        onConfirm={async () => {
          if (deletingCategory?.id) {
            await deleteCategory(deletingCategory.id)
            refetch()
          }
        }}
      />
    </div>
  )
}
