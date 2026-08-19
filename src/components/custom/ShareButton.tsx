"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Share2, Link as LinkIcon, MessageCircle, Users, X as XIcon, Mail, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getProductShareInfo } from "@/lib/services/products.service"
import { normalizeError } from "@/lib/api-error"
import { cn } from "@/lib/utils"
import type { ProductShareResponse } from "@/types"

interface ShareButtonProps {
  productId: string
}

const supportsNativeShare = typeof navigator !== "undefined" && Boolean(navigator.share)

interface ShareOption {
  key: string
  labelKey: string
  icon: typeof Share2
  build: (data: ProductShareResponse) => string
}

const SHARE_OPTIONS: ShareOption[] = [
  {
    key: "whatsapp",
    labelKey: "WhatsApp",
    icon: MessageCircle,
    build: (data) => `https://wa.me/?text=${encodeURIComponent(`${data.title} ${data.url}`)}`,
  },
  {
    key: "facebook",
    labelKey: "Facebook",
    icon: Users,
    build: (data) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`,
  },
  {
    key: "x",
    labelKey: "X",
    icon: XIcon,
    build: (data) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.title)}&url=${encodeURIComponent(data.url)}`,
  },
  {
    key: "email",
    labelKey: "email",
    icon: Mail,
    build: (data) =>
      `mailto:?subject=${encodeURIComponent(data.title)}&body=${encodeURIComponent(data.url)}`,
  },
]

export function ShareButton({ productId }: ShareButtonProps) {
  const t = useTranslations("products.share")
  const tApiErrors = useTranslations("apiErrors")
  const [open, setOpen] = useState(false)
  const [share, setShare] = useState<ProductShareResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen || share) return
    setIsLoading(true)
    try {
      setShare(await getProductShareInfo(productId))
    } catch (error) {
      toast.error(normalizeError(error, tApiErrors).message)
      setOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleNativeShare() {
    if (!share) return
    try {
      await navigator.share({ title: share.title, text: share.description, url: share.url })
      setOpen(false)
    } catch (error) {
      // A user cancelling the native share sheet throws an AbortError — not an error to surface.
      if (error instanceof DOMException && error.name === "AbortError") return
      toast.error(normalizeError(error, tApiErrors).message)
    }
  }

  async function handleCopyLink() {
    if (!share) return
    await navigator.clipboard.writeText(share.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareOptionLabel(option: ShareOption) {
    return option.labelKey === "email" ? t("email") : option.labelKey
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2">
          <Share2 className="size-4" />
          {t("button")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
        </DialogHeader>

        {isLoading && <p className="text-body text-ink/60">{t("loading")}</p>}

        {share && (
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4 overflow-x-auto pb-1">
              {supportsNativeShare && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex shrink-0 flex-col items-center gap-1.5 focus-visible:outline-none"
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-sangria text-white transition-transform hover:scale-105">
                    <Share2 className="size-5" />
                  </span>
                  <span className="text-small text-ink/70">{t("nativeShare")}</span>
                </button>
              )}
              {SHARE_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => window.open(option.build(share), "_blank", "noopener,noreferrer")}
                  className="flex shrink-0 flex-col items-center gap-1.5 focus-visible:outline-none"
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-cream text-ink ring-1 ring-black/10 transition-transform hover:scale-105">
                    <option.icon className="size-5" />
                  </span>
                  <span className="text-small text-ink/70">{shareOptionLabel(option)}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-md border border-black/10 bg-cream/50 p-1.5 pl-3">
              <LinkIcon className="size-4 shrink-0 text-ink/40" />
              <input
                readOnly
                value={share.url}
                onFocus={(e) => e.currentTarget.select()}
                className="min-w-0 flex-1 truncate bg-transparent text-body text-ink outline-none"
              />
              <Button size="sm" className={cn("shrink-0 gap-1.5", copied && "bg-delivered")} onClick={handleCopyLink}>
                {copied ? (
                  <>
                    <Check className="size-4" />
                    {t("copied")}
                  </>
                ) : (
                  t("copy")
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
