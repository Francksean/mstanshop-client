import { HeaderBar } from "@/components/layout/HeaderBar"
import { Footer } from "@/components/layout/Footer"
import { MobileNav } from "@/components/layout/MobileNav"
import { CartDrawer } from "@/components/custom/CartDrawer"

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderBar />
      <MobileNav />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
