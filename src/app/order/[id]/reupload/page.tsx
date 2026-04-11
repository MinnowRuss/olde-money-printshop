import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import ReuploadForm from './ReuploadForm'

interface ImageRecord {
  id: string
  filename: string
  thumbnail_path: string | null
  width: number | null
  height: number | null
}

interface OrderItemRecord {
  id: string
  image_id: string | null
  media_type_name: string | null
  print_size: string | null
  width: number
  height: number
  quantity: number
  images: ImageRecord | ImageRecord[] | null
}

/**
 * /order/[id]/reupload
 *
 * Customer-facing page for replacing a flagged image on an order.
 *
 * Preconditions checked server-side:
 *  - User is authenticated
 *  - The order belongs to this user
 *  - The order is in `processing` status AND has a non-null `print_notes`
 *    (i.e. the admin flagged it)
 *
 * Any precondition failure redirects to the order history page.
 *
 * Spec Ref: §4.1.7 / §8.1 — re-upload flow
 */
export default async function ReuploadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: orderId } = await params

  const supabase = await createClient()
  if (!supabase) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Service unavailable. Please try again later.</p>
      </div>
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?returnTo=/order/${orderId}/reupload`)
  }

  // Fetch the order (RLS ensures user can only see their own)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      id,
      user_id,
      status,
      print_notes,
      created_at,
      order_items (
        id,
        image_id,
        media_type_name,
        print_size,
        width,
        height,
        quantity,
        images (id, filename, thumbnail_path, width, height)
      )
    `)
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    redirect('/order/history')
  }

  // Ownership check (belt and braces — RLS should already prevent this)
  if (order.user_id !== user.id) {
    redirect('/order/history')
  }

  // Must be flagged
  const isFlagged = order.status === 'processing' && !!order.print_notes
  if (!isFlagged) {
    redirect('/order/history')
  }

  const orderItems = (order.order_items ?? []) as OrderItemRecord[]

  // Build signed thumbnail URLs for each item's existing image
  const itemsWithThumbs = await Promise.all(
    orderItems.map(async (item) => {
      const image = Array.isArray(item.images) ? item.images[0] : item.images
      let thumbnailUrl: string | null = null

      if (image?.thumbnail_path) {
        const { data: signedData } = await supabase.storage
          .from('images')
          .createSignedUrl(image.thumbnail_path, 3600)
        thumbnailUrl = signedData?.signedUrl ?? null
      }

      return {
        id: item.id,
        filename: image?.filename ?? 'Image',
        thumbnailUrl,
        mediaTypeName: item.media_type_name,
        printSize: item.print_size,
        printWidth: item.width,
        printHeight: item.height,
        quantity: item.quantity,
      }
    })
  )

  const orderNum = order.id.slice(0, 8).toUpperCase()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Back link */}
      <Link
        href="/order/history"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Order History
      </Link>

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Order #{orderNum}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          Re-upload a replacement image
        </h1>
        <p className="mt-2 text-muted-foreground">
          We noticed an issue with one of the images on this order. Upload a replacement
          and we&rsquo;ll queue it for re-review.
        </p>
      </div>

      {/* Flag reason */}
      <Card className="mb-6 border-red-200 bg-red-50/50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-700">Issue reported by our team</p>
            <p className="mt-1 text-sm text-red-600">{order.print_notes}</p>
          </div>
        </div>
      </Card>

      {/* Re-upload form */}
      {itemsWithThumbs.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">This order has no items to re-upload.</p>
          <Link href="/order/history" className="mt-4 inline-block">
            <Button variant="outline">Back to Order History</Button>
          </Link>
        </Card>
      ) : (
        <ReuploadForm orderId={order.id} items={itemsWithThumbs} />
      )}
    </div>
  )
}
