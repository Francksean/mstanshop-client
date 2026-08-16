"use client"

import Link from "next/link"
import { Menu, LogOut, User as UserIcon, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/stores/useAuthStore"
import { useUiStore } from "@/stores/useUiStore"
import { useAuth } from "@/hooks/useAuth"
import { useOrderNotifications } from "@/hooks/admin/useOrderNotifications"
import { formatPrice } from "@/lib/utils"

export function AdminHeader() {
  const user = useAuthStore((s) => s.user)
  const openMobileNav = useUiStore((s) => s.openMobileNav)
  const { logout } = useAuth()
  const { recentOrders, unreadCount, markAllSeen } = useOrderNotifications()

  const initials = user ? `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase() : "A"

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-black/10 bg-background px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        onClick={openMobileNav}
        aria-label="Ouvrir le menu"
      >
        <Menu className="size-5" />
      </Button>

      <span className="hidden text-h2 text-ink md:block">Backoffice</span>

      <div className="flex items-center gap-2">
        <DropdownMenu onOpenChange={(open) => !open && unreadCount > 0 && markAllSeen()}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="relative" aria-label="Notifications">
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-sangria text-[10px] font-medium text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="text-ink">Commandes récentes</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {recentOrders.length === 0 && (
              <p className="px-2 py-3 text-small text-ink/50">Aucune commande pour le moment.</p>
            )}
            {recentOrders.slice(0, 8).map((order) => (
              <DropdownMenuItem key={order.id} asChild>
                <Link href="/admin/orders" className="flex items-center justify-between gap-2">
                  <span className="flex flex-col">
                    <span className="text-ink">#{order.reference}</span>
                    <span className="text-small text-ink/50">
                      {order.customer?.firstName ? `${order.customer.firstName} ${order.customer.lastName}` : "Invité"}
                    </span>
                  </span>
                  <span className="text-small text-ink/70">{formatPrice(order.total)}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-gold-light/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sangria"
            >
              <Avatar className="size-7">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden text-small text-ink md:block">
                {user ? `${user.firstName} ${user.lastName}` : "Admin"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="flex items-center gap-2 text-ink">
                <UserIcon className="size-3.5" />
                {user?.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => logout()}>
              <LogOut className="size-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
