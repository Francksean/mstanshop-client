"use client"

import { useMemo, useState } from "react"
import { Plus, Pencil, Trash2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { EmptyState } from "@/components/custom/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import { CategoryFormDialog } from "@/components/admin/CategoryFormDialog"
import { CategoryPromotionDialog } from "@/components/admin/CategoryPromotionDialog"
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog"
import { RefreshButton } from "@/components/admin/RefreshButton"
import { useAdminCategories, type CategoryTreeGroup, type CategoryWithCount } from "@/hooks/admin/useAdminCategories"
import { deleteCategory } from "@/lib/services/admin/categories.service"

function PromoBadge({ category }: { category: CategoryWithCount }) {
  if (!category.promoActive) return null
  return (
    <span className="rounded-full bg-sangria/10 px-2 py-0.5 text-small font-medium text-sangria">
      -{category.promoDiscountValue}
      {category.promoDiscountType === "PERCENTAGE" ? "%" : " XAF"}
    </span>
  )
}

function CategoryActions({
  onPromote,
  onEdit,
  onDelete,
}: {
  onPromote: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button variant="ghost" size="icon-xs" aria-label="Promotion" onClick={onPromote}>
        <Tag className="size-3.5" />
      </Button>
      <Button variant="ghost" size="icon-xs" aria-label="Modifier" onClick={onEdit}>
        <Pencil className="size-3.5" />
      </Button>
      <Button variant="ghost" size="icon-xs" aria-label="Supprimer" onClick={onDelete}>
        <Trash2 className="size-3.5 text-sangria" />
      </Button>
    </div>
  )
}

export default function AdminCategoriesPage() {
  const { items, tree, isLoading, error, refetch } = useAdminCategories()
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null)
  const [defaultParentId, setDefaultParentId] = useState<string | undefined>(undefined)
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithCount | null>(null)
  const [promotingCategory, setPromotingCategory] = useState<CategoryWithCount | null>(null)
  const [search, setSearch] = useState("")

  function openCreate() {
    setEditingCategory(null)
    setDefaultParentId(undefined)
    setFormOpen(true)
  }

  function openCreateChild(rootId: string) {
    setEditingCategory(null)
    setDefaultParentId(rootId)
    setFormOpen(true)
  }

  function openEdit(category: CategoryWithCount) {
    setEditingCategory(category)
    setDefaultParentId(undefined)
    setFormOpen(true)
  }

  const filteredTree = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return tree
    return tree.reduce<CategoryTreeGroup[]>((acc, group) => {
      const rootMatches = group.root.name.toLowerCase().includes(query)
      const children = rootMatches
        ? group.children
        : group.children.filter((c) => c.name.toLowerCase().includes(query))
      if (rootMatches || children.length > 0) acc.push({ root: group.root, children })
      return acc
    }, [])
  }, [tree, search])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-h2 text-ink">Catégories</h1>
          <RefreshButton onRefresh={refetch} isLoading={isLoading} />
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Ajouter
        </Button>
      </div>

      {error && <p className="text-body text-sangria">{error}</p>}

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher une catégorie…"
        className="max-w-xs"
      />

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : filteredTree.length === 0 ? (
        <EmptyState
          title="Aucune catégorie"
          description="Ajoutez votre première catégorie pour commencer."
        />
      ) : (
        <Accordion type="multiple" className="rounded-lg border border-black/10 px-4">
          {filteredTree.map(({ root, children }) => (
            <AccordionItem key={root.id ?? root.slug} value={root.id ?? root.slug}>
              <div className="flex items-center gap-2">
                <AccordionTrigger className="flex-1 gap-2">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink">{root.name}</span>
                    <span className="text-small text-ink/50">
                      {root.productCount} produit{root.productCount > 1 ? "s" : ""}
                    </span>
                    <PromoBadge category={root} />
                  </span>
                </AccordionTrigger>
                <CategoryActions
                  onPromote={() => setPromotingCategory(root)}
                  onEdit={() => openEdit(root)}
                  onDelete={() => setDeletingCategory(root)}
                />
              </div>
              <AccordionContent>
                <div className="flex flex-col gap-2 pl-4">
                  {children.length === 0 ? (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-small text-ink/40">Aucune sous-catégorie</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => root.id && openCreateChild(root.id)}
                      >
                        <Plus className="size-3.5" />
                        Ajouter une sous-catégorie
                      </Button>
                    </div>
                  ) : (
                    <>
                      {children.map((child) => (
                        <div
                          key={child.id ?? child.slug}
                          className="flex items-center justify-between gap-2 border-l border-black/10 py-1.5 pl-3"
                        >
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-ink">{child.name}</span>
                            <span className="text-small text-ink/50">{child.productCount} produits</span>
                            <PromoBadge category={child} />
                          </span>
                          <CategoryActions
                            onPromote={() => setPromotingCategory(child)}
                            onEdit={() => openEdit(child)}
                            onDelete={() => setDeletingCategory(child)}
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="self-start"
                        onClick={() => root.id && openCreateChild(root.id)}
                      >
                        <Plus className="size-3.5" />
                        Ajouter une sous-catégorie
                      </Button>
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editingCategory}
        allCategories={items}
        defaultParentId={defaultParentId}
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
