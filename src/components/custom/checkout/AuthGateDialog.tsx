"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { startGoogleOAuth } from "@/lib/oauth"

interface AuthGateDialogProps {
  onLogin: () => void
  onGuest: () => void
}

export function AuthGateDialog({ onLogin, onGuest }: AuthGateDialogProps) {
  const t = useTranslations("checkout")

  return (
    <div className="mx-auto max-w-7xl px-4 py-24 md:px-8">
      <Dialog open onOpenChange={() => {}}>
        <DialogContent
          showCloseButton={false}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="font-heading text-h2">{t("continueDialog.title")}</DialogTitle>
            <DialogDescription>{t("continueDialog.description")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button size="lg" className="w-full" onClick={onLogin}>
              {t("continueDialog.login")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full gap-2"
              onClick={() => startGoogleOAuth("/checkout")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/auth/google.jpg" alt="" className="h-5 w-5 rounded-full object-cover" />
              {t("continueDialog.google")}
            </Button>
            <Button size="lg" variant="outline" className="w-full" onClick={onGuest}>
              {t("continueDialog.guest")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
