'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Loader2, Save, CheckCircle2, AlertCircle } from 'lucide-react'

const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

interface AdminOrderDetailFormProps {
  orderId: string
  currentStatus: string
  currentTrackingNumber: string
}

export default function AdminOrderDetailForm({
  orderId,
  currentStatus,
  currentTrackingNumber,
}: AdminOrderDetailFormProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const hasChanges =
    status !== currentStatus || trackingNumber !== currentTrackingNumber

  const handleSave = async () => {
    if (!hasChanges) return

    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          tracking_number: trackingNumber || null,
        }),
      })

      if (res.ok) {
        setSuccess(true)
        // Refresh the page to update server-rendered data
        router.refresh()
        // Auto-dismiss success after 3s
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const data = await res.json()
        setError(data.message ?? 'Failed to update order')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="sticky top-20">
      <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 sm:px-6">
        <h2 className="text-sm font-semibold text-zinc-900">
          Update Order
        </h2>
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        {/* Status dropdown */}
        <div>
          <Label htmlFor="status" className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Status
          </Label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1.5 flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tracking number */}
        <div>
          <Label htmlFor="tracking" className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Tracking Number
          </Label>
          <Input
            id="tracking"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="e.g. 1Z999AA10123456784"
            className="mt-1.5"
          />
          <p className="mt-1 text-xs text-zinc-400">
            USPS or UPS tracking number
          </p>
        </div>

        {/* Feedback messages */}
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <p className="text-sm text-green-600">
              Order updated! Customer has been notified.
            </p>
          </div>
        )}

        {/* Save button */}
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="w-full"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>

        {!hasChanges && (
          <p className="text-center text-xs text-zinc-400">
            No changes to save
          </p>
        )}
      </div>
    </Card>
  )
}
