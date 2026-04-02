'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Loader2,
  ImageIcon,
  RotateCcw,
  ClipboardList,
  AlertCircle,
} from 'lucide-react'

interface PastOrderItem {
  id: string
  order_id: string
  image_id: string | null
  media_type_slug: string | null
  media_type_name: string | null
  width: number
  height: number
  print_size: string | null
  option_slugs: string[] | null
  option_names: string[] | null
  unit_price: number
  quantity: number
  total: number | null
  created_at: string
  // Joined
  images?: {
    id: string
    filename: string
    thumbnail_path: string | null
  } | null
  // Parent order info
  orders?: {
    id: string
    created_at: string
    status: string
  }
}

export default function PastOrdersPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<PastOrderItem[]>([])
  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    let isActive = true

    async function loadPastOrders() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login?returnTo=/order/past-orders')
        return
      }

      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          images (id, filename, thumbnail_path),
          orders!inner (id, created_at, status)
        `)
        .eq('orders.user_id', user.id)
        .order('created_at', { ascending: false })

      if (!isActive) return

      if (error) {
        console.error('Failed to fetch past order items:', error)
        setLoading(false)
        return
      }

      const nextItems = (data as PastOrderItem[]) ?? []
      setItems(nextItems)

      const urls: Record<string, string> = {}
      for (const item of nextItems) {
        const img = item.images
        if (img?.thumbnail_path) {
          const { data: signedUrlData } = await supabase.storage
            .from('images')
            .createSignedUrl(img.thumbnail_path, 3600)

          if (!isActive) return

          if (signedUrlData?.signedUrl) {
            urls[item.id] = signedUrlData.signedUrl
          }
        }
      }

      if (!isActive) return

      setThumbUrls(urls)
      setLoading(false)
    }

    void loadPastOrders()

    return () => {
      isActive = false
    }
  }, [router, supabase])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          <p className="text-sm text-zinc-500">Loading past orders...</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100">
            <ClipboardList className="h-10 w-10 text-zinc-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              No past orders
            </h1>
            <p className="mt-2 text-zinc-600">
              Your past order items will appear here so you can easily reorder.
            </p>
          </div>
          <Link href="/image">
            <Button>
              <ImageIcon className="mr-2 h-4 w-4" />
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Past Orders
          </h1>
          <p className="mt-2 text-zinc-600">
            Reorder from your previous prints
          </p>
        </div>
        <Link href="/order/history">
          <Button variant="outline" size="sm">
            <ClipboardList className="mr-2 h-4 w-4" />
            Order History
          </Button>
        </Link>
      </div>

      {/* Items grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const imageDeleted = !item.images || !item.image_id
          const orderDate = item.orders
            ? new Date(item.orders.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : ''

          // Build reorder URL with query params for pre-filling
          const reorderParams = new URLSearchParams()
          if (item.media_type_slug) reorderParams.set('media', item.media_type_slug)
          if (item.width) reorderParams.set('w', String(item.width))
          if (item.height) reorderParams.set('h', String(item.height))
          if (item.option_slugs && item.option_slugs.length > 0) {
            reorderParams.set('options', item.option_slugs.join(','))
          }

          const reorderUrl = item.image_id
            ? `/order-image/${item.image_id}/finish?${reorderParams.toString()}`
            : '#'

          return (
            <Card key={item.id} className="overflow-hidden">
              {/* Thumbnail */}
              <div className="relative aspect-square bg-zinc-100">
                {thumbUrls[item.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbUrls[item.id]}
                    alt={item.images?.filename ?? 'Past print'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    {imageDeleted ? (
                      <div className="flex flex-col items-center gap-2 text-zinc-400">
                        <AlertCircle className="h-8 w-8" />
                        <span className="text-xs">Image deleted</span>
                      </div>
                    ) : (
                      <ImageIcon className="h-12 w-12 text-zinc-300" />
                    )}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-4">
                <p className="text-sm font-medium text-zinc-900 truncate">
                  {item.images?.filename ?? 'Deleted image'}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {item.media_type_name ?? 'Print'} &middot;{' '}
                  {item.print_size ?? `${item.width}×${item.height}"`}
                </p>
                {item.option_names && item.option_names.length > 0 && (
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {item.option_names.join(', ')}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-zinc-400">
                    Qty: {item.quantity} &middot; Ordered {orderDate}
                  </p>
                  <p className="text-sm font-semibold text-zinc-900">
                    ${Number(item.unit_price).toFixed(2)}
                  </p>
                </div>

                {/* Reorder button */}
                <div className="mt-3">
                  {imageDeleted ? (
                    <Button variant="outline" size="sm" className="w-full" disabled>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Image Unavailable
                    </Button>
                  ) : (
                    <Link href={reorderUrl}>
                      <Button variant="outline" size="sm" className="w-full">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Use This Image
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
