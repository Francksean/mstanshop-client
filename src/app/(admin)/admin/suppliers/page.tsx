"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable"
import { SupplierFormDialog } from "@/components/admin/SupplierFormDialog"
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog"
import { RefreshButton } from "@/components/admin/RefreshButton"
import { listSuppliers, deleteSupplier } from "@/lib/services/admin/suppliers.service"
import { normalizeError } from "@/lib/api-error"
import { useClientPagination } from "@/hooks/useClientPagination"
import type { Supplier } from "@/types"

export default function AdminSuppliersPage() {
  const [items, setItems] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [deleting, setDeleting] = useState<Supplier | null>(null)
  const [search, setSearch] = useState("")

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setItems(await listSuppliers())
    } catch (err) {
      setError(normalizeError(err).message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refetch()
  }, [refetch])

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(supplier: Supplier) {
    setEditing(supplier)
    setFormOpen(true)
  }

  const filteredItems = items.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
  const { pageItems, page, totalPages, totalElements, pageSize, setPage, setPageSize } =
    useClientPagination(filteredItems)

  const columns: DataTableColumn<Supplier>[] = [
    {
      key: "name",
      header: "Nom",
      mobileTitle: true,
      sortAccessor: (s) => s.name,
      render: (s) => <span className="font-medium text-ink">{s.name}</span>,
    },
    { key: "primaryPhone", header: "Téléphone principal", render: (s) => s.primaryPhone },
    { key: "secondaryPhone", header: "Téléphone secondaire", render: (s) => s.secondaryPhone || "—" },
    { key: "location", header: "Localisation", render: (s) => s.location || "—" },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      mobileAction: true,
      render: (s) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon-xs" aria-label="Modifier" onClick={() => openEdit(s)}>
            <Pencil className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label="Supprimer" onClick={() => setDeleting(s)}>
            <Trash2 className="size-3.5 text-sangria" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-h2 text-ink">Fournisseurs</h1>
          <RefreshButton onRefresh={refetch} isLoading={isLoading} />
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Ajouter
        </Button>
      </div>

      {error && <p className="text-body text-sangria">{error}</p>}

      <DataTable
        columns={columns}
        rows={pageItems}
        rowKey={(s) => s.id}
        isLoading={isLoading}
        emptyTitle="Aucun fournisseur"
        emptyDescription="Ajoutez votre premier fournisseur pour pouvoir l'associer à des produits."
        search={{ value: search, onChange: setSearch, placeholder: "Rechercher un fournisseur…" }}
        pagination={{ page, totalPages, totalElements, pageSize, onPageChange: setPage, onPageSizeChange: setPageSize }}
      />

      <SupplierFormDialog open={formOpen} onOpenChange={setFormOpen} supplier={editing} onSaved={refetch} />

      <DeleteConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Supprimer ce fournisseur ?"
        description={`"${deleting?.name}" sera définitivement supprimé.`}
        onConfirm={async () => {
          if (deleting) {
            await deleteSupplier(deleting.id)
            refetch()
          }
        }}
      />
    </div>
  )
}
