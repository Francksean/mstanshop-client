"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast !bg-card !text-ink !border !border-ink/10",
          actionButton: "!bg-sangria !text-white",
          success: "!border-delivered/40 !bg-delivered-light [&_[data-icon]]:!text-delivered",
          error: "!border-sangria/40 !bg-sangria/5 [&_[data-icon]]:!text-sangria",
          warning: "!border-gold/50 !bg-gold-light [&_[data-icon]]:!text-gold",
          info: "!border-ink/15 !bg-card [&_[data-icon]]:!text-ink/70",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
