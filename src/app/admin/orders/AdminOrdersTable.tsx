'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Search, Eye, Package } from 'lucide-react'

interface OrderRow {
  id: string
  userId: string
  customerName: string
  total: number
  status: string
  trackingNumber: string | null
  itemCount: number
  createdAt: string
  updatedAt: string
}

const STATUS_TABS = [
  'All', 'pending', 'processing', 'verified', 'queued',
  'printing', 'printed', 'shipped', 'delivered', 'cancelled',
] as const

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:     { label: 'Pending',     className: 'bg-zinc-100 text-foreground' },
  processing:  { label: 'Processing',  className: 'bg-yellow-100 text-yellow-800' },
  verified:    { label: 'Verified',    className: 'bg-emerald-100 text-emerald-800' },
  queued:      { label: 'Queued',      className: 'bg-indigo-100 text-indigo-800' },
  printing:    { label: 'Printing',    className: 'bg-purple-100 text-purple-800' },
  printed:     { label: 'Printed',     className: 'bg-teal-100 text-teal-800' },
  shipped:     { label: 'Shipped',     className: 'bg-blue-100 text-blue-800' },
  delivered:   { label: 'Delivered',   className: 'bg-green-100 text-green-800' },
  cancelled:   { label: 'Cancelled',   className: 'bg-red-100 text-red-700' },
}

export default function AdminOrdersTable({
  orders,
}: {
  orders: OrderRow[]
}) {
  const [activeTab, setActiveTab] = useState<string>('All')
  const [search, setSearch] = useState('')

  const filteredOrders = useMemo(() => {
    let result = orders

    // Filter by status tab
    if (activeTab !== 'All') {
      result = result.filter((o) => o.status === activeTab)
    }

    // Filter by search (order # or customer name)
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q)
      )
    }

    return result
  }, [orders, activeTab, search])

  return (
    <div>
      {/* Status filter tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const label = tab === 'All' ? 'All' : STATUS_CONFIG[tab]?.label ?? tab
          const count =
            tab === 'All'
              ? orders.length
              : orders.filter((o) => o.status === tab).length

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-zinc-100 text-muted-foreground hover:bg-white/[0.1]'
              }`}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-tertiary)]" />
        <Input
          placeholder="Search by order # or customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-center">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tracking</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusConfig =
                    STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
                  const date = new Date(order.createdAt).toLocaleDateString(
                    'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                      year: '2-digit',
                    }
                  )

                  return (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {order.customerName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{date}</td>
                      <td className="px-4 py-3 text-center text-foreground">
                        {order.itemCount}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.className}`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {order.trackingNumber ? (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Package className="h-3 w-3" />
                            {order.trackingNumber.slice(0, 12)}
                            {order.trackingNumber.length > 12 ? '…' : ''}
                          </span>
                        ) : (
                          <span className="text-xs text-[color:var(--text-tertiary)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="outline" size="xs">
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
