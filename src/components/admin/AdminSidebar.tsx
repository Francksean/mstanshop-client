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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUiStore } from "@/stores/useUiStore"

const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produits", icon: Package },
  { href: "/admin/categories", label: "Catégories", icon: Tags },
  { href: "/admin/orders", label: "Commandes", icon: ClipboardList },
  { href: "/admin/promo-codes", label: "Codes promo", icon: Tag },
  { href: "/admin/suppliers", label: "Fournisseurs", icon: Truck },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
]

function NavLinks({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Navigation admin" className="flex flex-col gap-0.5 px-2">
      {NAV_LINKS.map((link) => {
        const isActive = pathname.startsWith(link.href)
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-1.5 text-small transition-colors",
              isActive ? "bg-sangria/10 text-sangria" : "text-ink/70 hover:bg-gold-light/40 hover:text-ink"
            )}
          >
            <Icon className="size-4 shrink-0" />
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
          "hidden shrink-0 flex-col border-r border-black/10 bg-cream py-3 transition-[width] md:flex",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <div className={cn("flex h-9 items-center px-4 pb-3", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <span className="text-body font-bold tracking-tight text-ink">MSTANSHOP</span>
          )}
          <Button variant="ghost" size="icon-xs" onClick={toggleCollapsed} aria-label="Réduire le menu">
            {collapsed ? <PanelLeftOpen className="size-3.5" /> : <PanelLeftClose className="size-3.5" />}
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
