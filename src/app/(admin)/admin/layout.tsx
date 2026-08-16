"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { useAuthStore } from "@/stores/useAuthStore"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/login")
    }
  }, [isAdmin, router])

  if (!isAdmin || !user) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
