"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable"
import { WhatsAppTemplateFormDialog } from "@/components/admin/WhatsAppTemplateFormDialog"
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog"
import { RefreshButton } from "@/components/admin/RefreshButton"
import { listWhatsAppTemplates, deleteWhatsAppTemplate } from "@/lib/services/admin/whatsapp-templates.service"
import { normalizeError } from "@/lib/api-error"
import { useClientPagination } from "@/hooks/useClientPagination"
import { cn } from "@/lib/utils"
import type { WhatsAppTemplate, WhatsAppTemplateEventCode, WhatsAppTemplateStatus } from "@/types"

const EVENT_LABELS: Record<WhatsAppTemplateEventCode, string> = {
  ORDER_CONFIRMATION: "Confirmation de commande",
  PAYMENT_FAILED: "Échec de paiement",
  ORDER_CANCELLATION: "Annulation de commande",
}

const STATUS_LABELS: Record<WhatsAppTemplateStatus, string> = {
  APPROVED: "Approuvé",
  PENDING: "En attente",
  REJECTED: "Rejeté",
  PAUSED: "En pause",
}

const STATUS_CLASSES: Record<WhatsAppTemplateStatus, string> = {
  APPROVED: "text-delivered",
  PENDING: "text-gold",
  REJECTED: "text-sangria",
  PAUSED: "text-ink/50",
}

export default function AdminWhatsAppTemplatesPage() {
  const [items, setItems] = useState<WhatsAppTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<WhatsAppTemplate | null>(null)
  const [deleting, setDeleting] = useState<WhatsAppTemplate | null>(null)
  const [search, setSearch] = useState("")

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setItems(await listWhatsAppTemplates())
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

  function openEdit(template: WhatsAppTemplate) {
    setEditing(template)
    setFormOpen(true)
  }

  const filteredItems = items.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
  const { pageItems, page, totalPages, totalElements, pageSize, setPage, setPageSize } =
    useClientPagination(filteredItems)

  const columns: DataTableColumn<WhatsAppTemplate>[] = [
    {
      key: "name",
      header: "Nom",
      mobileTitle: true,
      sortAccessor: (t) => t.name.toLowerCase(),
      render: (t) => <span className="font-medium text-ink">{t.name}</span>,
    },
    { key: "language", header: "Langue", render: (t) => t.language.toUpperCase() },
    { key: "category", header: "Catégorie", render: (t) => t.category },
    {
      key: "eventCode",
      header: "Déclencheur",
      render: (t) => (t.eventCode ? EVENT_LABELS[t.eventCode] : <span className="text-ink/40">—</span>),
    },
    {
      key: "status",
      header: "Statut",
      render: (t) => <span className={cn("font-medium", STATUS_CLASSES[t.status])}>{STATUS_LABELS[t.status]}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      mobileAction: true,
      render: (t) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon-xs" aria-label="Modifier" onClick={() => openEdit(t)}>
            <Pencil className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label="Supprimer" onClick={() => setDeleting(t)}>
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
          <h1 className="text-h2 text-ink">Templates WhatsApp</h1>
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
        rowKey={(t) => t.id}
        isLoading={isLoading}
        emptyTitle="Aucun template"
        emptyDescription="Créez votre premier template WhatsApp pour lancer des envois automatiques."
        search={{ value: search, onChange: setSearch, placeholder: "Rechercher un template…" }}
        pagination={{ page, totalPages, totalElements, pageSize, onPageChange: setPage, onPageSizeChange: setPageSize }}
        onRowClick={openEdit}
      />

      <WhatsAppTemplateFormDialog open={formOpen} onOpenChange={setFormOpen} template={editing} onSaved={refetch} />

      <DeleteConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Supprimer ce template ?"
        description={`Le template "${deleting?.name}" sera supprimé côté Meta et en base.`}
        onConfirm={async () => {
          if (deleting) {
            await deleteWhatsAppTemplate(deleting.id)
            refetch()
          }
        }}
      />
    </div>
  )
}
