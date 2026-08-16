"use client"

import { useCallback, useEffect, useState } from "react"
import { getAllOrders } from "@/lib/services/admin/orders.service"
import type { OrderSummary } from "@/types"

const POLL_INTERVAL_MS = 30_000
const LAST_SEEN_KEY = "mstan-admin-orders-last-seen"
const BATCH_SIZE = 20

function readLastSeen(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(LAST_SEEN_KEY)
}

export function useOrderNotifications() {
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const poll = useCallback(async () => {
    try {
      const result = await getAllOrders({ page: 0, size: BATCH_SIZE })
      setRecentOrders(result.items)
      const lastSeen = readLastSeen()
      const unread = lastSeen
        ? result.items.filter((o) => new Date(o.createdAt).getTime() > new Date(lastSeen).getTime()).length
        : result.items.length
      setUnreadCount(unread)
    } catch {
      // Silent — notifications are a convenience, not a critical path.
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void poll()
    const interval = setInterval(poll, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [poll])

  function markAllSeen() {
    const latest = recentOrders.reduce<string | null>((max, o) => {
      if (!max || new Date(o.createdAt).getTime() > new Date(max).getTime()) return o.createdAt
      return max
    }, null)
    if (latest && typeof window !== "undefined") {
      localStorage.setItem(LAST_SEEN_KEY, latest)
    }
    setUnreadCount(0)
  }

  return { recentOrders, unreadCount, markAllSeen }
}
