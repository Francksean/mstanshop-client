"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog"
import { updateUserRole } from "@/lib/services/admin/users.service"
import type { UserRole } from "@/types"

const ROLE_LABELS: Record<UserRole, string> = {
  ROLE_USER: "Utilisateur",
  ROLE_ADMIN: "Administrateur",
}

interface UserRoleSelectProps {
  userId: string
  role: UserRole
  onChanged: (role: UserRole) => void
}

export function UserRoleSelect({ userId, role, onChanged }: UserRoleSelectProps) {
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null)

  async function performChange() {
    if (!pendingRole) return
    await updateUserRole(userId, pendingRole)
    onChanged(pendingRole)
    toast.success("Rôle mis à jour.")
  }

  return (
    <>
      <Select value={role} onValueChange={(value) => setPendingRole(value as UserRole)}>
        <SelectTrigger size="sm" aria-label="Changer le rôle">
          <SelectValue>{ROLE_LABELS[role]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(ROLE_LABELS) as UserRole[]).map((option) => (
            <SelectItem key={option} value={option}>
              {ROLE_LABELS[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DeleteConfirmDialog
        open={Boolean(pendingRole)}
        onOpenChange={(v) => !v && setPendingRole(null)}
        variant="default"
        title="Changer le rôle de cet utilisateur ?"
        description={
          pendingRole
            ? `Ce compte deviendra "${ROLE_LABELS[pendingRole]}".`
            : ""
        }
        confirmLabel="Confirmer"
        pendingLabel="Mise à jour…"
        onConfirm={performChange}
      />
    </>
  )
}
