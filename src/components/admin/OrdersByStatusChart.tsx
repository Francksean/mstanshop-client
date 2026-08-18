"use client"

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { STATUS_CONFIG } from "@/components/custom/OrderStatusBadge"
import type { OrderStatus } from "@/types"

const STATUS_COLORS: Record<OrderStatus, string> = {
  EN_ATTENTE: "var(--ink)",
  PAYEE: "var(--gold)",
  EXPEDIEE: "var(--sangria)",
  LIVREE: "var(--delivered)",
  ANNULEE: "var(--sangria-dark)",
  ECHEC_PAIEMENT: "var(--gold-hover)",
}

interface OrdersByStatusChartProps {
  data: { status: OrderStatus; count: number }[]
}

export function OrdersByStatusChart({ data }: OrdersByStatusChartProps) {
  const chartData = data.map((entry) => ({ ...entry, label: STATUS_CONFIG[entry.status].label }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commandes par statut</CardTitle>
      </CardHeader>
      <CardContent className="h-60 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: -20, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              angle={-35}
              textAnchor="end"
              height={50}
              interval={0}
              tick={{ fill: "var(--ink)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis allowDecimals={false} tick={{ fill: "var(--ink)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "var(--gold-light)" }}
              contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }}
            />
            <Bar dataKey="count" name="Commandes" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function OrdersByStatusChartShimmer() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Commandes par statut</CardTitle>
      </CardHeader>
      <CardContent className="h-60 sm:h-64">
        <Skeleton className="h-full w-full" />
      </CardContent>
    </Card>
  )
}
