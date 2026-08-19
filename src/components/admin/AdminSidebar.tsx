"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Tags,
  ClipboardList,
  Users,
  Tag,
  Truck,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUiStore } from "@/stores/useUiStore"

interface NavChild {
  href?: string
  label: string
  disabled?: boolean
}

interface NavLink {
  href?: string
  label: string
  icon: typeof LayoutDashboard
  children?: NavChild[]
}

const NAV_LINKS: NavLink[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produits", icon: Package },
  { href: "/admin/categories", label: "Catégories", icon: Tags },
  { href: "/admin/orders", label: "Commandes", icon: ClipboardList },
  { href: "/admin/promo-codes", label: "Codes promo", icon: Tag },
  { href: "/admin/suppliers", label: "Fournisseurs", icon: Truck },
  {
    label: "Communications",
    icon: MessageSquare,
    children: [
      { href: "/admin/communications/whatsapp", label: "WhatsApp" },
      { label: "SMS", disabled: true },
      { label: "Emails", disabled: true },
    ],
  },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
]

function NavLinks({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Navigation admin" className="flex flex-col gap-1 px-3">
      {NAV_LINKS.map((link) => {
        const Icon = link.icon

        if (link.children) {
          const hasActiveChild = link.children.some((child) => child.href && pathname.startsWith(child.href))
          return (
            <div key={link.label} className="flex flex-col gap-1">
              <div
                className={cn(
                  "flex items-center gap-3.5 rounded-md px-3.5 py-3 text-body font-medium",
                  hasActiveChild ? "text-sangria" : "text-ink/70"
                )}
              >
                <Icon className="size-5 shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </div>
              {!collapsed && (
                <div className="flex flex-col gap-1 pl-11">
                  {link.children.map((child) => {
                    if (child.disabled || !child.href) {
                      return (
                        <span
                          key={child.label}
                          className="flex items-center gap-2 rounded-md px-3.5 py-2 text-small text-ink/35"
                        >
                          {child.label}
                          <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink/40">
                            À venir
                          </span>
                        </span>
                      )
                    }
                    const isChildActive = pathname.startsWith(child.href)
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onNavigate}
                        aria-current={isChildActive ? "page" : undefined}
                        className={cn(
                          "rounded-md px-3.5 py-2 text-small font-medium transition-colors",
                          isChildActive
                            ? "bg-sangria/10 text-sangria"
                            : "text-ink/70 hover:bg-gold-light/40 hover:text-ink"
                        )}
                      >
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        }

        const isActive = Boolean(link.href && pathname.startsWith(link.href))
        return (
          <Link
            key={link.href}
            href={link.href!}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3.5 rounded-md px-3.5 py-3 text-body font-medium transition-colors",
              isActive ? "bg-sangria/10 text-sangria" : "text-ink/70 hover:bg-gold-light/40 hover:text-ink"
            )}
          >
            <Icon className="size-5 shrink-0" />
            {!collapsed && <span>{link.label}</span>}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminSidebar() {
  const collapsed = useUiStore((s) => s.isAdminSidebarCollapsed)
  const toggleCollapsed = useUiStore((s) => s.toggleAdminSidebar)
  const isMobileOpen = useUiStore((s) => s.isMobileNavOpen)
  const closeMobileNav = useUiStore((s) => s.closeMobileNav)

  return (
    <>
      <aside
        className={cn(
          "hidden fixed left-0 top-0 h-screen shrink-0 flex-col border-r border-black/10 bg-cream py-4 transition-[width] md:flex",
          collapsed ? "w-20" : "w-72"
        )}
      >
        <div className={cn("flex h-10 items-center px-4 pb-4", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <span className="text-h3 font-bold tracking-tight text-ink">MSTANSHOP</span>
          )}
          <Button variant="ghost" size="icon" onClick={toggleCollapsed} aria-label="Réduire le menu">
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </Button>
        </div>
        <NavLinks collapsed={collapsed} />
      </aside>

      <Sheet open={isMobileOpen} onOpenChange={(open) => !open && closeMobileNav()}>
        <SheetContent side="left" className="bg-background md:hidden">
          <SheetHeader>
            <SheetTitle className="text-h2">Administration</SheetTitle>
          </SheetHeader>
          <NavLinks onNavigate={closeMobileNav} />
        </SheetContent>
      </Sheet>
    </>
  )
}
