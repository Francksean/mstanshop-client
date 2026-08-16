"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface OrdersChartProps {
  data: { label: string; count: number }[]
}

export function OrdersChart({ data }: OrdersChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Commandes des 7 derniers jours</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "var(--ink)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "var(--ink)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "var(--gold-light)" }}
              contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }}
            />
            <Bar dataKey="count" name="Commandes" fill="var(--sangria)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function OrdersChartShimmer() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Commandes des 7 derniers jours</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <Skeleton className="h-full w-full" />
      </CardContent>
    </Card>
  )
}
