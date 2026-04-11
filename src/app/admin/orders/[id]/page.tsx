import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import AdminOrderDetailForm from './AdminOrderDetailForm'

interface ImageRecord {
  id: string
  filename: string
  storage_path: string | null
  thumbnail_path: string | null
  width: number | null
  height: number | null
}

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
  images: ImageRecord | ImageRecord[] | null
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
        images (id, filename, storage_path, thumbnail_path, width, height)
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

  // Generate signed thumbnail URLs and compute DPI for each item
  const itemsWithDpi = await Promise.all(
    orderItems.map(async (item) => {
      const image = Array.isArray(item.images) ? item.images[0] : item.images
      let thumbnailUrl: string | null = null
      let dpi: number | null = null

      if (image?.thumbnail_path) {
        const { data: signedData } = await supabase.storage
          .from('images')
          .createSignedUrl(image.thumbnail_path, 3600) // 1 hour
        thumbnailUrl = signedData?.signedUrl ?? null
      }

      // DPI = image pixels / print inches (use the larger dimension for accuracy)
      if (image?.width && image?.height && item.width > 0 && item.height > 0) {
        const dpiW = image.width / item.width
        const dpiH = image.height / item.height
        dpi = Math.round(Math.min(dpiW, dpiH))
      }

      return {
        id: item.id,
        filename: image?.filename ?? 'Deleted image',
        thumbnailUrl,
        dpi,
        printWidth: item.width,
        printHeight: item.height,
        imagePixelWidth: image?.width ?? null,
        imagePixelHeight: image?.height ?? null,
        mediaTypeName: item.media_type_name,
        printSize: item.print_size,
        optionNames: item.option_names,
        unitPrice: item.unit_price,
        quantity: item.quantity,
        discountPct: item.discount_pct,
        total: item.total,
      }
    })
  )

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
                Order Items ({itemsWithDpi.length})
              </h2>
            </div>
            <div className="divide-y divide-zinc-100">
              {itemsWithDpi.map((item) => {
                const dpiColor =
                  item.dpi === null
                    ? null
                    : item.dpi < 150
                      ? 'bg-red-100 text-red-700'
                      : item.dpi < 200
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-emerald-100 text-emerald-700'

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 px-4 py-4 sm:px-6"
                  >
                  {/* Thumbnail */}
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                    {item.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnailUrl}
                        alt={item.filename}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs text-[color:var(--text-tertiary)]">
                        {item.filename.slice(0, 6)}
                      </span>
                    )}
                    {item.dpi !== null && dpiColor && (
                      <span
                        className={`absolute bottom-0 right-0 rounded-tl px-1 py-0.5 text-[10px] font-bold ${dpiColor}`}
                      >
                        {item.dpi}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {item.filename}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.mediaTypeName ?? 'Print'} &middot;{' '}
                      {item.printSize ?? `${item.printWidth}×${item.printHeight}"`} &middot;
                      Qty: {item.quantity}
                    </p>
                    {item.dpi !== null && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.imagePixelWidth}×{item.imagePixelHeight}px &middot;{' '}
                        <span className={item.dpi < 150 ? 'font-semibold text-red-600' : item.dpi < 200 ? 'font-semibold text-orange-600' : 'text-emerald-600'}>
                          {item.dpi} DPI
                        </span>
                      </p>
                    )}
                    {item.optionNames && item.optionNames.length > 0 && (
                      <p className="mt-0.5 text-xs text-[color:var(--text-tertiary)]">
                        Options: {item.optionNames.join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      ${Number(item.total ?? item.unitPrice * item.quantity).toFixed(2)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-muted-foreground">
                        ${Number(item.unitPrice).toFixed(2)} ea
                      </p>
                    )}
                    {item.discountPct && Number(item.discountPct) > 0 && (
                      <p className="text-xs font-medium text-green-600">
                        -{Number(item.discountPct)}%
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
            verifiedAt={order.verified_at ?? null}
            items={itemsWithDpi}
          />
        </div>
      </div>
    </div>
  )
}
