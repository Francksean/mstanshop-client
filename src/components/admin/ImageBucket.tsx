"use client"

import { Trash2, Upload } from "lucide-react"
import { resolveMediaUrl } from "@/lib/utils"
import type { ProductImage } from "@/types"

interface ImageBucketProps {
  label: string
  images: ProductImage[]
  onRemoveExisting: (id: string) => void
  newFiles: File[]
  onAddFiles: (files: File[]) => void
  onRemoveNewFile: (index: number) => void
}

export function ImageBucket({
  label,
  images,
  onRemoveExisting,
  newFiles,
  onAddFiles,
  onRemoveNewFile,
}: ImageBucketProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-small font-medium text-ink/60">{label}</span>
      <div className="flex flex-wrap gap-2">
        {images.map((img) => (
          <div key={img.id} className="group relative size-16 overflow-hidden rounded-md border border-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolveMediaUrl(img.url)} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label="Retirer cette image"
              onClick={() => onRemoveExisting(img.id)}
              className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        ))}
        {newFiles.map((file, idx) => (
          <div key={idx} className="group relative size-16 overflow-hidden rounded-md border border-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label="Retirer cette image"
              onClick={() => onRemoveNewFile(idx)}
              className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        ))}
        <label className="flex size-16 shrink-0 cursor-pointer items-center justify-center rounded-md border border-dashed border-black/20 text-ink/40 hover:bg-cream/40">
          <Upload className="size-4" />
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) onAddFiles(Array.from(e.target.files))
              e.target.value = ""
            }}
          />
        </label>
      </div>
    </div>
  )
}
