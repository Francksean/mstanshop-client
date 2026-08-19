import type { UserRole } from "@/types"

const ROLE_LABELS: Record<UserRole, string> = {
  ROLE_USER: "Utilisateur",
  ROLE_ADMIN: "Administrateur",
}

interface UserRoleSelectProps {
  role: UserRole
}

export function UserRoleSelect({ role }: UserRoleSelectProps) {
  return <span className="text-body text-ink">{ROLE_LABELS[role]}</span>
}
