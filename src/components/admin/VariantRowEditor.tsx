"use client"

import { useState } from "react"
import { Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ImageBucket } from "@/components/admin/ImageBucket"
import type { Product, ProductImage } from "@/types"

export const HEX_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

export interface VariantRow {
  key: string
  id?: string
  colorName: string
  colorHex: string
  /** 0 or 1 entry for an already-persisted row (`id` set, `PUT` only takes one size); 0+ for a new row not yet created (`POST` accepts several sizes at once). */
  sizes: string[]
  stock: string
  active: boolean
  existingImages: ProductImage[]
  removedImageIds: string[]
  newFiles: File[]
}

/** Empty `colorHex` means "no color" — a valid, distinct kind of row (size-only variant). */
function isHexValid(colorHex: string): boolean {
  return colorHex === "" || HEX_REGEX.test(colorHex)
}

export function isVariantRowInvalid(row: VariantRow): boolean {
  return !isHexValid(row.colorHex) || Number(row.stock) < 0 || (!row.id && row.sizes.length === 0)
}

let rowCounter = 0
export function newVariantRow(): VariantRow {
  rowCounter += 1
  return {
    key: `row-${rowCounter}`,
    colorName: "",
    colorHex: "",
    sizes: [],
    stock: "0",
    active: true,
    existingImages: [],
    removedImageIds: [],
    newFiles: [],
  }
}

export function variantRowsFromProduct(product: Product): VariantRow[] {
  return product.variants.map((v) => ({
    key: v.id,
    id: v.id,
    colorName: v.colorName ?? "",
    colorHex: v.colorHex ?? "",
    sizes: v.size ? [v.size] : [],
    stock: String(v.stock),
    active: v.active,
    existingImages: v.images,
    removedImageIds: [],
    newFiles: [],
  }))
}

function SizeChipsInput({ sizes, onChange }: { sizes: string[]; onChange: (sizes: string[]) => void }) {
  const [draft, setDraft] = useState("")

  function commitDraft() {
    const value = draft.trim()
    setDraft("")
    if (!value || sizes.includes(value)) return
    onChange([...sizes, value])
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      commitDraft()
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-1.5">
        {sizes.map((size) => (
          <span
            key={size}
            className="flex items-center gap-1 rounded-full bg-gold-light/60 px-2 py-0.5 text-small text-ink"
          >
            {size}
            <button
              type="button"
              aria-label={`Retirer la taille ${size}`}
              onClick={() => onChange(sizes.filter((s) => s !== size))}
              className="text-ink/50 hover:text-ink"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        placeholder="S, M, L…"
      />
    </div>
  )
}

export function VariantRowEditor({
  row,
  onChange,
  onRemove,
  showImages = true,
}: {
  row: VariantRow
  onChange: (patch: Partial<VariantRow>) => void
  onRemove: () => void
  /** Off for a not-yet-created row (product creation, or a new variant row not saved yet) — no variantId to attach images to. */
  showImages?: boolean
}) {
  const hexValid = isHexValid(row.colorHex)
  const isExisting = Boolean(row.id)

  return (
    <div className="flex flex-col gap-3 rounded-md border border-black/10 p-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field data-invalid={!hexValid}>
          <FieldLabel>Couleur (optionnel)</FieldLabel>
          <div className="flex items-center gap-2">
            <Input
              value={row.colorHex}
              onChange={(e) => onChange({ colorHex: e.target.value })}
              placeholder="Aucune"
              aria-invalid={!hexValid}
              className="flex-1"
            />
            {row.colorHex.length > 0 && (
              <input
                type="color"
                value={hexValid && row.colorHex.length === 7 ? row.colorHex : "#000000"}
                onChange={(e) => onChange({ colorHex: e.target.value })}
                className="h-9 w-9 shrink-0 rounded-md border border-black/10"
                aria-label="Sélecteur de couleur"
              />
            )}
          </div>
        </Field>
        <Field>
          <FieldLabel>Nom couleur</FieldLabel>
          <Input value={row.colorName} onChange={(e) => onChange({ colorName: e.target.value })} placeholder="Bordeaux" />
        </Field>
        <Field data-invalid={!isExisting && row.sizes.length === 0}>
          <FieldLabel>{isExisting ? "Taille" : "Tailles"}</FieldLabel>
          {isExisting ? (
            <Input
              value={row.sizes[0] ?? ""}
              onChange={(e) => onChange({ sizes: e.target.value ? [e.target.value] : [] })}
              placeholder="M"
            />
          ) : (
            <SizeChipsInput sizes={row.sizes} onChange={(sizes) => onChange({ sizes })} />
          )}
        </Field>
        <Field data-invalid={Number(row.stock) < 0}>
          <FieldLabel>Stock{!isExisting && row.sizes.length > 1 ? " (par taille)" : ""}</FieldLabel>
          <Input type="number" value={row.stock} onChange={(e) => onChange({ stock: e.target.value })} />
        </Field>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-small text-ink">
          <Checkbox checked={row.active} onCheckedChange={(v) => onChange({ active: Boolean(v) })} />
          Variante active
        </label>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Supprimer la variante" onClick={onRemove}>
          <Trash2 className="size-4 text-sangria" />
        </Button>
      </div>

      {showImages && (
        <ImageBucket
          label="Photos de cette couleur"
          images={row.existingImages}
          onRemoveExisting={(id) =>
            onChange({
              existingImages: row.existingImages.filter((i) => i.id !== id),
              removedImageIds: [...row.removedImageIds, id],
            })
          }
          newFiles={row.newFiles}
          onAddFiles={(files) => onChange({ newFiles: [...row.newFiles, ...files] })}
          onRemoveNewFile={(idx) => onChange({ newFiles: row.newFiles.filter((_, i) => i !== idx) })}
        />
      )}
    </div>
  )
}
