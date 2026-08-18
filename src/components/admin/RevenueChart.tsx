"use client"

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPrice } from "@/lib/utils"

interface RevenueChartProps {
  data: { date: string; revenue: number; orderCount: number }[]
}

function formatDateLabel(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
}

// Full "1 250 000 FCFA" ticks don't fit a narrow Y-axis on mobile — compact
// notation ("1,3 M") keeps them short; the tooltip still shows the full amount.
function formatCompactAmount(value: number): string {
  return new Intl.NumberFormat("fr", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

// A tick per data point overlaps badly once the range spans 30-90 days —
// cap the number of visible X-axis labels regardless of range length.
const MAX_X_TICKS = 6

export function RevenueChart({ data }: RevenueChartProps) {
  const tickInterval = Math.max(0, Math.ceil(data.length / MAX_X_TICKS) - 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{"Chiffre d'affaires"}</CardTitle>
      </CardHeader>
      <CardContent className="h-52 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateLabel}
              interval={tickInterval}
              tick={{ fill: "var(--ink)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatCompactAmount}
              tick={{ fill: "var(--ink)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip
              labelFormatter={(date) => formatDateLabel(String(date))}
              formatter={(value, name) => [
                name === "revenue" ? formatPrice(Number(value)) : String(value),
                name === "revenue" ? "Chiffre d'affaires" : "Commandes",
              ]}
              contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }}
            />
            <Line type="monotone" dataKey="revenue" stroke="var(--sangria)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function RevenueChartShimmer() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{"Chiffre d'affaires"}</CardTitle>
      </CardHeader>
      <CardContent className="h-52 sm:h-64">
        <Skeleton className="h-full w-full" />
      </CardContent>
    </Card>
  )
}
