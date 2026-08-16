"use client"

import { ProfileForm } from "@/components/custom/ProfileForm"
import { useAuthStore } from "@/stores/useAuthStore"

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)

  if (!user) return null

  return <ProfileForm user={user} />
}
