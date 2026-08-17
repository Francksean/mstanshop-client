"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable"
import { PromoCodeFormDialog } from "@/components/admin/PromoCodeFormDialog"
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog"
import { listPromoCodes, deletePromoCode } from "@/lib/services/admin/promo.service"
import { normalizeError } from "@/lib/api-error"
import { formatPrice } from "@/lib/utils"
import { useClientPagination } from "@/hooks/useClientPagination"
import type { PromoCode } from "@/types"

export default function AdminPromoCodesPage() {
  const [items, setItems] = useState<PromoCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<PromoCode | null>(null)
  const [deleting, setDeleting] = useState<PromoCode | null>(null)
  const [search, setSearch] = useState("")

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setItems(await listPromoCodes())
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

  function openEdit(promo: PromoCode) {
    setEditing(promo)
    setFormOpen(true)
  }

  const filteredItems = items.filter((p) => p.code.toLowerCase().includes(search.toLowerCase()))
  const { pageItems, page, totalPages, totalElements, pageSize, setPage, setPageSize } =
    useClientPagination(filteredItems)

  const columns: DataTableColumn<PromoCode>[] = [
    {
      key: "code",
      header: "Code",
      mobileTitle: true,
      sortAccessor: (p) => p.code,
      render: (p) => <span className="font-medium text-ink">{p.code}</span>,
    },
    {
      key: "discount",
      header: "Réduction",
      sortAccessor: (p) => p.discountValue,
      render: (p) => (p.discountType === "PERCENTAGE" ? `${p.discountValue}%` : formatPrice(p.discountValue)),
    },
    { key: "uses", header: "Utilisations", sortAccessor: (p) => p.usesCount, render: (p) => `${p.usesCount}${p.maxUses ? ` / ${p.maxUses}` : ""}` },
    {
      key: "expiresAt",
      header: "Expire le",
      sortAccessor: (p) => (p.expiresAt ? new Date(p.expiresAt).getTime() : 0),
      render: (p) =>
        p.expiresAt
          ? new Date(p.expiresAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
          : "—",
    },
    {
      key: "active",
      header: "Statut",
      render: (p) => (
        <span className={p.active ? "text-delivered" : "text-ink/50"}>{p.active ? "Actif" : "Inactif"}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      mobileAction: true,
      render: (p) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon-xs" aria-label="Modifier" onClick={() => openEdit(p)}>
            <Pencil className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label="Supprimer" onClick={() => setDeleting(p)}>
            <Trash2 className="size-3.5 text-sangria" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-h2 text-ink">Codes promo</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Ajouter
        </Button>
      </div>

      {error && <p className="text-body text-sangria">{error}</p>}

      <DataTable
        columns={columns}
        rows={pageItems}
        rowKey={(p) => p.id}
        isLoading={isLoading}
        emptyTitle="Aucun code promo"
        emptyDescription="Créez votre premier code promo pour lancer une opération commerciale."
        search={{ value: search, onChange: setSearch, placeholder: "Rechercher un code…" }}
        pagination={{ page, totalPages, totalElements, pageSize, onPageChange: setPage, onPageSizeChange: setPageSize }}
      />

      <PromoCodeFormDialog open={formOpen} onOpenChange={setFormOpen} promoCode={editing} onSaved={refetch} />

      <DeleteConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Supprimer ce code promo ?"
        description={`Le code "${deleting?.code}" sera définitivement supprimé.`}
        onConfirm={async () => {
          if (deleting) {
            await deletePromoCode(deleting.id)
            refetch()
          }
        }}
      />
    </div>
  )
}
