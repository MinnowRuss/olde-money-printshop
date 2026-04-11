'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Search, Eye, Package, ShieldCheck, Flag, Loader2 } from 'lucide-react'

interface OrderRow {
  id: string
  userId: string
  customerName: string
  total: number
  status: string
  trackingNumber: string | null
  printNotes: string | null
  itemCount: number
  createdAt: string
  updatedAt: string
}

const STATUS_TABS = [
  'All', 'Awaiting Verification', 'Flagged', 'verified', 'queued',
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
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>('All')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkVerifying, setBulkVerifying] = useState(false)

  const filteredOrders = useMemo(() => {
    let result = orders

    // Filter by virtual tabs
    if (activeTab === 'Awaiting Verification') {
      result = result.filter((o) => o.status === 'processing' && !o.printNotes)
    } else if (activeTab === 'Flagged') {
      result = result.filter((o) => o.status === 'processing' && !!o.printNotes)
    } else if (activeTab !== 'All') {
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

  // Count helpers for tabs
  const tabCount = (tab: string) => {
    if (tab === 'All') return orders.length
    if (tab === 'Awaiting Verification')
      return orders.filter((o) => o.status === 'processing' && !o.printNotes).length
    if (tab === 'Flagged')
      return orders.filter((o) => o.status === 'processing' && !!o.printNotes).length
    return orders.filter((o) => o.status === tab).length
  }

  const tabLabel = (tab: string) => {
    if (tab === 'Awaiting Verification' || tab === 'Flagged' || tab === 'All') return tab
    return STATUS_CONFIG[tab]?.label ?? tab
  }

  // Bulk verify
  const canBulkVerify = activeTab === 'Awaiting Verification' && selectedIds.size > 0

  const handleBulkVerify = async () => {
    if (!canBulkVerify) return
    setBulkVerifying(true)
    try {
      const res = await fetch('/api/admin/orders/bulk-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: Array.from(selectedIds) }),
      })
      if (res.ok) {
        setSelectedIds(new Set())
        router.refresh()
      }
    } catch {
      // Silent — user can retry
    } finally {
      setBulkVerifying(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    const verifiable = filteredOrders.filter(
      (o) => o.status === 'processing' && !o.printNotes
    )
    if (selectedIds.size === verifiable.length && verifiable.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(verifiable.map((o) => o.id)))
    }
  }

  const showCheckboxes = activeTab === 'Awaiting Verification'

  return (
    <div>
      {/* Status filter tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const count = tabCount(tab)
          const label = tabLabel(tab)

          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                setSelectedIds(new Set())
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground'
                  : tab === 'Awaiting Verification' && count > 0
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : tab === 'Flagged' && count > 0
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-zinc-100 text-muted-foreground hover:bg-white/[0.1]'
              }`}
            >
              {tab === 'Awaiting Verification' && <ShieldCheck className="mr-1 inline h-3 w-3" />}
              {tab === 'Flagged' && <Flag className="mr-1 inline h-3 w-3" />}
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Search + Bulk actions */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-tertiary)]" />
          <Input
            placeholder="Search by order # or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {canBulkVerify && (
          <Button
            onClick={handleBulkVerify}
            disabled={bulkVerifying}
            className="shrink-0 border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {bulkVerifying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="mr-2 h-4 w-4" />
            )}
            Verify Selected ({selectedIds.size})
          </Button>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {showCheckboxes && (
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.size > 0 &&
                        selectedIds.size ===
                          filteredOrders.filter(
                            (o) => o.status === 'processing' && !o.printNotes
                          ).length
                      }
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-border"
                    />
                  </th>
                )}
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
                    colSpan={showCheckboxes ? 9 : 8}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isFlagged = order.status === 'processing' && !!order.printNotes
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
                      className={`transition-colors hover:bg-muted/40 ${
                        isFlagged ? 'bg-red-50/50' : ''
                      }`}
                    >
                      {showCheckboxes && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(order.id)}
                            onChange={() => toggleSelect(order.id)}
                            className="h-4 w-4 rounded border-border"
                          />
                        </td>
                      )}
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
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.className}`}
                          >
                            {statusConfig.label}
                          </span>
                          {isFlagged && (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                              <Flag className="mr-0.5 h-2.5 w-2.5" />
                              Flagged
                            </span>
                          )}
                        </div>
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
