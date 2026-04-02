import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ClipboardList, ImageIcon, ExternalLink, Package } from 'lucide-react'
import OrderItemsExpander from './OrderItemsExpander'

// Status badge styling
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:    { label: 'Pending',    className: 'bg-zinc-100 text-zinc-700' },
  processing: { label: 'Processing', className: 'bg-yellow-100 text-yellow-800' },
  shipped:    { label: 'Shipped',    className: 'bg-blue-100 text-blue-800' },
  delivered:  { label: 'Delivered',  className: 'bg-green-100 text-green-800' },
  cancelled:  { label: 'Cancelled',  className: 'bg-red-100 text-red-700' },
}

/**
 * Generate a tracking URL from the tracking number.
 * Detects USPS (starts with 9, 20+ digits) vs UPS (starts with 1Z).
 */
function getTrackingUrl(trackingNumber: string): string {
  const trimmed = trackingNumber.trim()
  if (trimmed.startsWith('1Z')) {
    return `https://www.ups.com/track?tracknum=${encodeURIComponent(trimmed)}`
  }
  // Default to USPS
  return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(trimmed)}`
}

export default async function OrderHistoryPage() {
  const supabase = await createClient()
  if (!supabase) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-zinc-500">Service unavailable. Please try again later.</p>
      </div>
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?returnTo=/order/history')
  }

  // Fetch orders with item counts
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      total,
      status,
      tracking_number,
      created_at,
      updated_at,
      order_items (
        id,
        image_id,
        media_type_name,
        print_size,
        width,
        height,
        option_names,
        unit_price,
        quantity,
        discount_pct,
        total
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch orders:', error)
  }

  // Empty state
  if (!orders || orders.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100">
            <ClipboardList className="h-10 w-10 text-zinc-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">No orders yet</h1>
            <p className="mt-2 text-zinc-600">
              Once you place your first order, it will appear here.
            </p>
          </div>
          <Link href="/image">
            <Button>
              <ImageIcon className="mr-2 h-4 w-4" />
              Browse Images
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Order History
        </h1>
        <p className="mt-2 text-zinc-600">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </p>
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        {orders.map((order) => {
          const statusConfig = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
          const itemCount = order.order_items?.length ?? 0
          const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })

          return (
            <Card key={order.id} className="overflow-hidden">
              {/* Order header row */}
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Order
                    </p>
                    <p className="font-mono text-sm font-semibold text-zinc-900">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>

                  <div className="hidden h-8 w-px bg-zinc-200 sm:block" />

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Date
                    </p>
                    <p className="text-sm text-zinc-900">{orderDate}</p>
                  </div>

                  <div className="hidden h-8 w-px bg-zinc-200 sm:block" />

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Items
                    </p>
                    <p className="text-sm text-zinc-900">
                      {itemCount} {itemCount === 1 ? 'print' : 'prints'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Status badge */}
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.className}`}
                  >
                    {statusConfig.label}
                  </span>

                  {/* Tracking link */}
                  {order.tracking_number && (
                    <a
                      href={getTrackingUrl(order.tracking_number)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      <Package className="h-3.5 w-3.5" />
                      Track
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  {/* Total */}
                  <p className="text-lg font-bold text-zinc-900">
                    ${Number(order.total).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Expandable order items */}
              <OrderItemsExpander items={order.order_items ?? []} />
            </Card>
          )
        })}
      </div>

      {/* Reorder CTA */}
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/order/past-orders">
          <Button variant="outline">
            Reorder from Past Items
          </Button>
        </Link>
        <Link href="/image">
          <Button>
            <ImageIcon className="mr-2 h-4 w-4" />
            Create New Order
          </Button>
        </Link>
      </div>
    </div>
  )
}
