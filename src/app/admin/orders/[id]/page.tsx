import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import AdminOrderDetailForm from './AdminOrderDetailForm'

interface OrderItemRecord {
  id: string
  media_type_name: string | null
  print_size: string | null
  width: number
  height: number
  option_names: string[] | null
  unit_price: number
  quantity: number
  discount_pct: number | null
  total: number | null
  images:
    | {
        id: string
        filename: string
        thumbnail_path: string | null
      }
    | {
        id: string
        filename: string
        thumbnail_path: string | null
      }[]
    | null
}

interface CustomerProfileRecord {
  full_name: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: orderId } = await params

  const supabase = await createClient()
  if (!supabase) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Service unavailable.</p>
      </div>
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?returnTo=/admin/orders/${orderId}`)
  }

  // Double-check admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/')
  }

  // Fetch order with items and customer profile
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        image_id,
        media_type_name,
        media_type_slug,
        print_size,
        width,
        height,
        option_names,
        unit_price,
        quantity,
        discount_pct,
        discount_amount,
        total,
        images (id, filename, thumbnail_path)
      ),
      profiles!inner (full_name, address_line1, address_line2, city, state, zip, country)
    `)
    .eq('id', orderId)
    .single()

  if (error || !order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Order Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The order you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/admin/orders" className="mt-4 inline-block">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
      </div>
    )
  }

  const customerProfile = Array.isArray(order.profiles)
    ? (order.profiles[0] as CustomerProfileRecord | undefined)
    : (order.profiles as CustomerProfileRecord | null)
  const orderItems = (order.order_items ?? []) as OrderItemRecord[]

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/admin/orders"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Admin &middot; Order Detail
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Placed{' '}
          {new Date(order.created_at).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Items + Customer Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-muted/40 px-4 py-3 sm:px-6">
              <h2 className="text-sm font-semibold text-foreground">
                Order Items ({orderItems.length})
              </h2>
            </div>
            <div className="divide-y divide-zinc-100">
              {orderItems.map((item) => {
                const image = Array.isArray(item.images) ? item.images[0] : item.images

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 px-4 py-4 sm:px-6"
                  >
                  {/* Thumbnail placeholder */}
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                    <span className="text-xs text-[color:var(--text-tertiary)]">
                      {image?.filename
                        ? image.filename.slice(0, 6)
                        : 'N/A'}
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {image?.filename ?? 'Deleted image'}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.media_type_name ?? 'Print'} &middot;{' '}
                      {item.print_size ?? `${item.width}×${item.height}"`} &middot;
                      Qty: {item.quantity}
                    </p>
                    {item.option_names && item.option_names.length > 0 && (
                      <p className="mt-0.5 text-xs text-[color:var(--text-tertiary)]">
                        Options: {item.option_names.join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      ${Number(item.total ?? item.unit_price * item.quantity).toFixed(2)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-muted-foreground">
                        ${Number(item.unit_price).toFixed(2)} ea
                      </p>
                    )}
                    {item.discount_pct && Number(item.discount_pct) > 0 && (
                      <p className="text-xs font-medium text-green-600">
                        -{Number(item.discount_pct)}%
                      </p>
                    )}
                  </div>
                </div>
                )
              })}
            </div>

            {/* Totals */}
            <div className="border-t border-border bg-muted/40 px-4 py-3 sm:px-6">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-foreground">Order Total</span>
                <span className="text-lg font-bold text-foreground">
                  ${Number(order.total).toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          {/* Customer Info */}
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-muted/40 px-4 py-3 sm:px-6">
              <h2 className="text-sm font-semibold text-foreground">
                Customer Information
              </h2>
            </div>
            <div className="space-y-3 px-4 py-4 sm:px-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Name
                </p>
                <p className="text-sm text-foreground">
                  {customerProfile?.full_name || 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  User ID
                </p>
                <p className="font-mono text-xs text-muted-foreground">{order.user_id}</p>
              </div>
              {customerProfile?.address_line1 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Shipping Address
                  </p>
                  <p className="text-sm text-foreground">
                    {customerProfile.address_line1}
                    {customerProfile.address_line2 && (
                      <>
                        <br />
                        {customerProfile.address_line2}
                      </>
                    )}
                    <br />
                    {customerProfile.city}, {customerProfile.state}{' '}
                    {customerProfile.zip}
                    <br />
                    {customerProfile.country}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Status & Tracking form */}
        <div>
          <AdminOrderDetailForm
            orderId={order.id}
            currentStatus={order.status}
            currentTrackingNumber={order.tracking_number ?? ''}
            currentPrintNotes={order.print_notes ?? ''}
          />
        </div>
      </div>
    </div>
  )
}
