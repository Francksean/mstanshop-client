"use client"

import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCategories } from "@/hooks/useCategories"
import { useUiStore } from "@/stores/useUiStore"

export function MobileNav() {
  const isOpen = useUiStore((s) => s.isMobileNavOpen)
  const closeMobileNav = useUiStore((s) => s.closeMobileNav)
  const { categories } = useCategories()

  const navLinks = [
    { href: "/products", label: "Boutique" },
    ...categories.map((c) => ({ href: `/products?category=${c.slug}`, label: c.name })),
  ]

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeMobileNav()}>
      <SheetContent side="left" className="bg-background">
        <SheetHeader>
          <SheetTitle className="font-heading text-h2">Menu</SheetTitle>
        </SheetHeader>
        <nav aria-label="Navigation principale" className="flex flex-col gap-1 px-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobileNav}
              className="rounded-md px-3 py-3 text-body text-ink transition-colors hover:bg-gold-light/40"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
