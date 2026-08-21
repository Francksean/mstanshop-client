"use client"

import { DataTable, type DataTableColumn } from "@/components/admin/DataTable"
import { UserRoleSelect } from "@/components/admin/UserRoleSelect"
import { RefreshButton } from "@/components/admin/RefreshButton"
import { useAdminUsers } from "@/hooks/admin/useAdminUsers"
import type { AdminUserResponse, AuthProvider } from "@/types"

const AUTH_PROVIDER_LABELS: Record<AuthProvider, string> = {
  LOCAL: "Email / mot de passe",
  GOOGLE: "Google",
}

export default function AdminUsersPage() {
  const {
    items,
    page,
    totalPages,
    totalElements,
    pageSize,
    isLoading,
    error,
    search,
    setSearch,
    setPageSize,
    setPage,
    refetch,
  } = useAdminUsers()

  const columns: DataTableColumn<AdminUserResponse>[] = [
    {
      key: "email",
      header: "Email",
      mobileTitle: true,
      sortAccessor: (u) => u.email.toLowerCase(),
      render: (u) => <span className="font-medium text-ink">{u.email}</span>,
    },
    {
      key: "name",
      header: "Nom",
      sortAccessor: (u) => `${u.firstName} ${u.lastName}`.toLowerCase(),
      render: (u) => `${u.firstName} ${u.lastName}`,
    },
    {
      key: "role",
      header: "Rôle",
      render: (u) => <UserRoleSelect role={u.roles[0] ?? "ROLE_USER"} />,
    },
    {
      key: "authProvider",
      header: "Mode de connexion",
      render: (u) => AUTH_PROVIDER_LABELS[u.authProvider] ?? u.authProvider,
    },
    {
      key: "createdAt",
      header: "Date et heure d'inscription",
      sortAccessor: (u) => new Date(u.createdAt).getTime(),
      render: (u) =>
        new Date(u.createdAt).toLocaleString("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-h2 text-ink">Utilisateurs</h1>
        <RefreshButton onRefresh={refetch} isLoading={isLoading} />
      </div>

      {error && <p className="text-body text-sangria">{error}</p>}

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(u) => u.id}
        isLoading={isLoading}
        emptyTitle="Aucun utilisateur"
        emptyDescription="Les comptes créés apparaîtront ici."
        pagination={{
          page,
          totalPages,
          totalElements,
          pageSize,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
          zeroIndexed: true,
        }}
        search={{ value: search, onChange: setSearch, placeholder: "Rechercher un utilisateur…" }}
      />
    </div>
  )
}
