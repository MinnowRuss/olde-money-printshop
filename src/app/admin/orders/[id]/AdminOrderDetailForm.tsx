'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Flag,
  XCircle,
  Send,
  AlertTriangle,
  Clock,
} from 'lucide-react'

interface OrderItemDpi {
  id: string
  filename: string
  dpi: number | null
  printWidth: number
  printHeight: number
}

interface AdminOrderDetailFormProps {
  orderId: string
  currentStatus: string
  currentTrackingNumber: string
  currentPrintNotes?: string | null
  verifiedAt?: string | null
  items: OrderItemDpi[]
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  verified: 'Verified',
  queued: 'Queued',
  printing: 'Printing',
  printed: 'Printed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default function AdminOrderDetailForm({
  orderId,
  currentStatus,
  currentTrackingNumber,
  currentPrintNotes,
  verifiedAt,
  items,
}: AdminOrderDetailFormProps) {
  const router = useRouter()
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber)
  const [flagNotes, setFlagNotes] = useState('')
  const [showFlagForm, setShowFlagForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const isFlagged = currentStatus === 'processing' && !!currentPrintNotes
  const isAwaitingVerification = currentStatus === 'processing' && !currentPrintNotes
  const isVerified = currentStatus === 'verified'

  // DPI warnings
  const lowDpiItems = items.filter((i) => i.dpi !== null && i.dpi < 200)
  const criticalDpiItems = items.filter((i) => i.dpi !== null && i.dpi < 150)

  const showSuccess = (msg: string) => {
    setSuccess(msg)
    setError('')
    setTimeout(() => setSuccess(''), 3000)
  }

  // ─── Action: Verify Order ───
  const handleVerify = async () => {
    setActionInProgress('verify')
    setError('')
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/verify`, {
        method: 'PATCH',
      })
      if (res.ok) {
        showSuccess('Order verified successfully')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.message ?? 'Failed to verify order')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setActionInProgress(null)
    }
  }

  // ─── Action: Flag Order ───
  const handleFlag = async () => {
    if (!flagNotes.trim()) {
      setError('Please enter a reason for flagging this order.')
      return
    }
    setActionInProgress('flag')
    setError('')
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/flag`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printNotes: flagNotes.trim() }),
      })
      if (res.ok) {
        setFlagNotes('')
        setShowFlagForm(false)
        showSuccess('Order flagged')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.message ?? 'Failed to flag order')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setActionInProgress(null)
    }
  }

  // ─── Action: Clear Flag ───
  const handleClearFlag = async () => {
    setActionInProgress('clearFlag')
    setError('')
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/flag`, {
        method: 'DELETE',
      })
      if (res.ok) {
        showSuccess('Flag cleared — order is ready for verification')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.message ?? 'Failed to clear flag')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setActionInProgress(null)
    }
  }

  // ─── Action: Notify Customer ───
  const handleNotifyCustomer = async () => {
    setActionInProgress('notify')
    setError('')
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/flag`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          printNotes: currentPrintNotes,
          notifyCustomer: true,
        }),
      })
      if (res.ok) {
        showSuccess('Customer notified via email')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.message ?? 'Failed to notify customer')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setActionInProgress(null)
    }
  }

  // ─── Action: Save Tracking ───
  const handleSaveTracking = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: currentStatus,
          tracking_number: trackingNumber || null,
        }),
      })
      if (res.ok) {
        showSuccess('Tracking number updated')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.message ?? 'Failed to update tracking')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const isLoading = actionInProgress !== null || saving

  return (
    <Card className="sticky top-20">
      <div className="border-b border-border bg-muted/40 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Order Actions
          </h2>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isFlagged
                ? 'bg-red-100 text-red-700'
                : currentStatus === 'verified'
                  ? 'bg-emerald-100 text-emerald-800'
                  : currentStatus === 'processing'
                    ? 'bg-yellow-100 text-yellow-800'
                    : currentStatus === 'queued' || currentStatus === 'printing'
                      ? 'bg-purple-100 text-purple-800'
                      : currentStatus === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : currentStatus === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-zinc-100 text-foreground'
            }`}
          >
            {isFlagged ? 'Flagged' : STATUS_LABELS[currentStatus] ?? currentStatus}
          </span>
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        {/* ─── DPI Warnings ─── */}
        {criticalDpiItems.length > 0 && (
          <div className="flex items-start gap-2 rounded-md bg-red-50 px-3 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-700">
                Critical: Low resolution
              </p>
              <p className="mt-0.5 text-xs text-red-600">
                {criticalDpiItems.map((i) => `${i.filename} (${i.dpi} DPI)`).join(', ')}
                {' — '}below 150 DPI minimum for quality prints
              </p>
            </div>
          </div>
        )}
        {lowDpiItems.length > 0 && criticalDpiItems.length === 0 && (
          <div className="flex items-start gap-2 rounded-md bg-orange-50 px-3 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-orange-700">
                Warning: Suboptimal resolution
              </p>
              <p className="mt-0.5 text-xs text-orange-600">
                {lowDpiItems.map((i) => `${i.filename} (${i.dpi} DPI)`).join(', ')}
                {' — '}below 200 DPI recommended
              </p>
            </div>
          </div>
        )}

        {/* ─── Awaiting Verification Actions ─── */}
        {isAwaitingVerification && (
          <>
            <Button
              onClick={handleVerify}
              disabled={isLoading}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {actionInProgress === 'verify' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Verify Order
            </Button>

            {!showFlagForm ? (
              <Button
                onClick={() => setShowFlagForm(true)}
                disabled={isLoading}
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50"
              >
                <Flag className="mr-2 h-4 w-4" />
                Flag Issue
              </Button>
            ) : (
              <div className="space-y-3 rounded-lg border border-red-200 bg-red-50/50 p-3">
                <Label className="text-xs font-medium text-red-700">
                  Describe the issue
                </Label>
                <textarea
                  value={flagNotes}
                  onChange={(e) => setFlagNotes(e.target.value)}
                  placeholder="e.g. Low-res image, wrong crop, color profile issue..."
                  rows={3}
                  className="flex w-full rounded-md border border-red-200 bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleFlag}
                    disabled={isLoading}
                    size="sm"
                    className="flex-1 bg-red-600 text-white hover:bg-red-700"
                  >
                    {actionInProgress === 'flag' ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Flag className="mr-1 h-3 w-3" />
                    )}
                    Flag
                  </Button>
                  <Button
                    onClick={() => {
                      setShowFlagForm(false)
                      setFlagNotes('')
                    }}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── Flagged Order Actions ─── */}
        {isFlagged && (
          <>
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
              <div className="flex items-start gap-2">
                <Flag className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <div>
                  <p className="text-xs font-medium text-red-700">Flagged Issue</p>
                  <p className="mt-1 text-sm text-red-600">{currentPrintNotes}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleClearFlag}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {actionInProgress === 'clearFlag' ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <XCircle className="mr-1 h-3 w-3" />
                )}
                Clear Flag
              </Button>
              <Button
                onClick={handleNotifyCustomer}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                {actionInProgress === 'notify' ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Send className="mr-1 h-3 w-3" />
                )}
                Notify Customer
              </Button>
            </div>

            <Button
              onClick={handleVerify}
              disabled={isLoading}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {actionInProgress === 'verify' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Verify Order (clears flag)
            </Button>
          </>
        )}

        {/* ─── Verified Info ─── */}
        {isVerified && (
          <div className="flex items-start gap-2 rounded-md bg-emerald-50 px-3 py-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <div>
              <p className="text-sm font-medium text-emerald-700">Verified</p>
              {verifiedAt && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-emerald-600">
                  <Clock className="h-3 w-3" />
                  {new Date(verifiedAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ─── Status Info (for pipeline statuses) ─── */}
        {['queued', 'printing', 'printed'].includes(currentStatus) && (
          <div className="flex items-center gap-2 rounded-md bg-purple-50 px-3 py-2.5">
            <Loader2 className="h-4 w-4 text-purple-500" />
            <p className="text-sm font-medium text-purple-700">
              {STATUS_LABELS[currentStatus]}
            </p>
          </div>
        )}

        {/* ─── Tracking Number (always visible for shipped/delivered, optional for others) ─── */}
        {['shipped', 'delivered', 'printed'].includes(currentStatus) && (
          <div>
            <Label
              htmlFor="tracking"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Tracking Number
            </Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                id="tracking"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. 1Z999AA10123456784"
              />
              <Button
                onClick={handleSaveTracking}
                disabled={saving || trackingNumber === currentTrackingNumber}
                size="sm"
                variant="outline"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ─── Feedback Messages ─── */}
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}
      </div>
    </Card>
  )
}
