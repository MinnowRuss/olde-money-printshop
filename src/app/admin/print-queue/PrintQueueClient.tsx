'use client'

import { useState, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Printer,
  LayoutGrid,
  AlertTriangle,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Package,
  Ruler,
  Layers,
  BarChart3,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────

interface OrderItem {
  id: string
  mediaTypeSlug: string
  mediaTypeName: string
  width: number
  height: number
  quantity: number
  printSize: string | null
  imageFilename: string
  storagePath: string
}

interface QueueOrder {
  id: string
  customerName: string
  total: number
  createdAt: string
  printNotes: string | null
  items: OrderItem[]
}

interface ActiveBatch {
  id: string
  status: string
  media_type_slug: string
  roll_width_in: number
  estimated_length_in: number | null
  error_message: string | null
  order_ids: string[]
  created_at: string
}

interface NestingPreview {
  batchId: string
  itemCount: number
  estimatedLengthIn: number
  wastePercent: number
  stripCount: number
}

interface Props {
  orders: QueueOrder[]
  activeBatches: ActiveBatch[]
}

// ── Constants ────────────────────────────────────────────────

const ROLL_WIDTHS = [
  { value: '24', label: '24″ Roll' },
  { value: '36', label: '36″ Roll' },
  { value: '44', label: '44″ Roll' },
]

const BATCH_STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof Printer }> = {
  queued:    { label: 'Queued',    className: 'bg-indigo-100 text-indigo-800', icon: Layers },
  submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-800',    icon: Package },
  printing:  { label: 'Printing',  className: 'bg-purple-100 text-purple-800', icon: Printer },
  failed:    { label: 'Failed',    className: 'bg-red-100 text-red-700',       icon: AlertTriangle },
}

// ── Component ────────────────────────────────────────────────

export default function PrintQueueClient({ orders, activeBatches }: Props) {
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set())
  const [rollWidth, setRollWidth] = useState('44')
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [nestingPreview, setNestingPreview] = useState<NestingPreview | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Group orders by media type for easier batch selection
  const ordersByMediaType = useMemo(() => {
    const groups: Record<string, { mediaTypeName: string; orders: QueueOrder[] }> = {}
    for (const order of orders) {
      for (const item of order.items) {
        if (!groups[item.mediaTypeSlug]) {
          groups[item.mediaTypeSlug] = { mediaTypeName: item.mediaTypeName, orders: [] }
        }
        // Avoid duplicate orders in same group
        if (!groups[item.mediaTypeSlug].orders.find((o) => o.id === order.id)) {
          groups[item.mediaTypeSlug].orders.push(order)
        }
      }
    }
    return groups
  }, [orders])

  // Determine which media type is selected (based on first selected order)
  const selectedMediaType = useMemo(() => {
    if (selectedOrderIds.size === 0) return null
    const firstId = [...selectedOrderIds][0]
    for (const [slug, group] of Object.entries(ordersByMediaType)) {
      if (group.orders.find((o) => o.id === firstId)) return slug
    }
    return null
  }, [selectedOrderIds, ordersByMediaType])

  // Total items across selected orders for the selected media type
  const selectedItemCount = useMemo(() => {
    if (!selectedMediaType) return 0
    let count = 0
    for (const order of orders) {
      if (!selectedOrderIds.has(order.id)) continue
      for (const item of order.items) {
        if (item.mediaTypeSlug === selectedMediaType) {
          count += item.quantity
        }
      }
    }
    return count
  }, [orders, selectedOrderIds, selectedMediaType])

  const failedBatches = useMemo(
    () => activeBatches.filter((b) => b.status === 'failed'),
    [activeBatches]
  )

  const activePrintBatches = useMemo(
    () => activeBatches.filter((b) => b.status !== 'failed'),
    [activeBatches]
  )

  // ── Handlers ───────────────────────────────────────────────

  const toggleOrder = useCallback(
    (orderId: string, mediaTypeSlug: string) => {
      setSelectedOrderIds((prev) => {
        const next = new Set(prev)
        if (next.has(orderId)) {
          next.delete(orderId)
        } else {
          // Only allow selecting orders from the same media type
          if (selectedMediaType && selectedMediaType !== mediaTypeSlug) {
            return prev // Don't mix media types
          }
          next.add(orderId)
        }
        return next
      })
      // Clear any existing preview when selection changes
      setNestingPreview(null)
      setError(null)
    },
    [selectedMediaType]
  )

  const selectAllInGroup = useCallback(
    (mediaTypeSlug: string) => {
      const group = ordersByMediaType[mediaTypeSlug]
      if (!group) return
      // If all are selected, deselect all. Otherwise select all.
      const allSelected = group.orders.every((o) => selectedOrderIds.has(o.id))
      if (allSelected) {
        setSelectedOrderIds(new Set())
      } else {
        setSelectedOrderIds(new Set(group.orders.map((o) => o.id)))
      }
      setNestingPreview(null)
      setError(null)
    },
    [ordersByMediaType, selectedOrderIds]
  )

  const handleGenerateLayout = useCallback(async () => {
    if (selectedOrderIds.size === 0 || !selectedMediaType) return

    setGenerating(true)
    setError(null)
    setNestingPreview(null)

    try {
      const res = await fetch('/api/admin/print-batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: [...selectedOrderIds],
          rollWidthIn: Number(rollWidth),
          mediaTypeSlug: selectedMediaType,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: 'Request failed' }))
        throw new Error(data.message || `Error ${res.status}`)
      }

      const data = await res.json()
      setNestingPreview({
        batchId: data.batchId,
        itemCount: data.itemCount,
        estimatedLengthIn: data.estimatedLengthIn,
        wastePercent: data.wastePercent,
        stripCount: data.stripCount,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate layout')
    } finally {
      setGenerating(false)
    }
  }, [selectedOrderIds, selectedMediaType, rollWidth])

  const handleSubmitToPrinter = useCallback(async () => {
    if (!nestingPreview) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/print-batches/${nestingPreview.batchId}/submit`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: 'Request failed' }))
        throw new Error(data.message || `Error ${res.status}`)
      }

      // Success — reload the page to reflect new state
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit batch')
    } finally {
      setSubmitting(false)
    }
  }, [nestingPreview])

  const handleRetryBatch = useCallback(async (batchId: string) => {
    try {
      const res = await fetch(`/api/admin/print-batches/${batchId}/submit`, {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: 'Retry failed' }))
        throw new Error(data.message || `Error ${res.status}`)
      }
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry batch')
    }
  }, [])

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Failed Batch Alerts */}
      {failedBatches.map((batch) => (
        <div
          key={batch.id}
          className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-900">
                Batch #{batch.id.slice(0, 8)} failed
              </p>
              <p className="text-sm text-red-700">
                {batch.error_message || 'Unknown error'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRetryBatch(batch.id)}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      ))}

      {/* Active Batches Status */}
      {activePrintBatches.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
            Active Batches
          </h2>
          <div className="space-y-2">
            {activePrintBatches.map((batch) => {
              const cfg = BATCH_STATUS_CONFIG[batch.status]
              const Icon = cfg?.icon ?? Package
              return (
                <div
                  key={batch.id}
                  className="flex items-center justify-between rounded-md border border-zinc-200 px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-zinc-500" />
                    <div>
                      <span className="text-sm font-medium text-zinc-900">
                        Batch #{batch.id.slice(0, 8)}
                      </span>
                      <span className="ml-2 text-xs text-zinc-500">
                        {batch.media_type_slug} &middot; {batch.roll_width_in}″ roll
                        {batch.estimated_length_in
                          ? ` · ${batch.estimated_length_in}″ est.`
                          : ''}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      cfg?.className ?? 'bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    {cfg?.label ?? batch.status}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Order Selection */}
      {orders.length === 0 ? (
        <Card className="p-10 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
          <p className="text-sm text-zinc-500">No verified orders waiting for batching.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Roll Width Selector */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-zinc-700">Roll Width</label>
            <Select value={rollWidth} onValueChange={(v) => v && setRollWidth(v)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLL_WIDTHS.map((rw) => (
                  <SelectItem key={rw.value} value={rw.value}>
                    {rw.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Orders grouped by media type */}
          {Object.entries(ordersByMediaType).map(([slug, group]) => {
            const isDisabledGroup = selectedMediaType !== null && selectedMediaType !== slug
            const allSelected = group.orders.every((o) => selectedOrderIds.has(o.id))

            return (
              <Card key={slug} className={`p-5 ${isDisabledGroup ? 'opacity-50' : ''}`}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-700">
                    {group.mediaTypeName}
                    <span className="ml-2 font-normal text-zinc-400">
                      ({group.orders.length} order{group.orders.length !== 1 ? 's' : ''})
                    </span>
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isDisabledGroup}
                    onClick={() => selectAllInGroup(slug)}
                    className="text-xs"
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>

                <div className="space-y-2">
                  {group.orders.map((order) => {
                    const mediaItems = order.items.filter((i) => i.mediaTypeSlug === slug)
                    const totalPrints = mediaItems.reduce((sum, i) => sum + i.quantity, 0)
                    const isSelected = selectedOrderIds.has(order.id)

                    return (
                      <label
                        key={order.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors ${
                          isSelected
                            ? 'border-indigo-300 bg-indigo-50'
                            : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                        } ${isDisabledGroup ? 'pointer-events-none' : ''}`}
                      >
                        <Checkbox
                          checked={isSelected}
                          disabled={isDisabledGroup}
                          onCheckedChange={() => toggleOrder(order.id, slug)}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-900">
                              {order.customerName}
                            </span>
                            <span className="text-xs text-zinc-400">
                              #{order.id.slice(0, 8)}
                            </span>
                          </div>
                          <div className="mt-0.5 text-xs text-zinc-500">
                            {totalPrints} print{totalPrints !== 1 ? 's' : ''} &middot;{' '}
                            {mediaItems.map((i) => `${i.width}×${i.height}″`).join(', ')}
                            {order.printNotes && (
                              <span className="ml-2 italic text-amber-600">
                                Note: {order.printNotes}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-zinc-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </Card>
            )
          })}

          {/* Action Bar */}
          <div className="sticky bottom-4 z-10">
            <Card className="border-zinc-300 bg-white/95 p-4 shadow-lg backdrop-blur">
              {!nestingPreview ? (
                /* Step 1: Generate Layout */
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-600">
                    {selectedOrderIds.size > 0 ? (
                      <>
                        <span className="font-medium text-zinc-900">
                          {selectedOrderIds.size} order{selectedOrderIds.size !== 1 ? 's' : ''}
                        </span>{' '}
                        selected &middot; {selectedItemCount} print
                        {selectedItemCount !== 1 ? 's' : ''} &middot; {rollWidth}″ roll
                      </>
                    ) : (
                      'Select orders above to create a print batch'
                    )}
                  </div>
                  <Button
                    onClick={handleGenerateLayout}
                    disabled={selectedOrderIds.size === 0 || generating}
                  >
                    {generating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LayoutGrid className="mr-2 h-4 w-4" />
                    )}
                    Generate Layout
                  </Button>
                </div>
              ) : (
                /* Step 2: Review & Submit */
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500">
                        <Package className="h-3.5 w-3.5" />
                        Items
                      </div>
                      <p className="mt-0.5 text-lg font-semibold text-zinc-900">
                        {nestingPreview.itemCount}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500">
                        <Ruler className="h-3.5 w-3.5" />
                        Length
                      </div>
                      <p className="mt-0.5 text-lg font-semibold text-zinc-900">
                        {nestingPreview.estimatedLengthIn}″
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500">
                        <Layers className="h-3.5 w-3.5" />
                        Strips
                      </div>
                      <p className="mt-0.5 text-lg font-semibold text-zinc-900">
                        {nestingPreview.stripCount}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500">
                        <BarChart3 className="h-3.5 w-3.5" />
                        Waste
                      </div>
                      <p className="mt-0.5 text-lg font-semibold text-zinc-900">
                        {nestingPreview.wastePercent}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-200 pt-3">
                    <Button
                      variant="ghost"
                      onClick={() => setNestingPreview(null)}
                      disabled={submitting}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmitToPrinter}
                      disabled={submitting}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {submitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Printer className="mr-2 h-4 w-4" />
                      )}
                      Send to Printer
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
