import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PrintQueueClient from './PrintQueueClient'

interface OrderForQueue {
  id: string
  status: string
  total: number
  created_at: string
  print_notes: string | null
  print_batch_id: string | null
  profiles: { full_name: string } | { full_name: string }[] | null
  order_items: {
    id: string
    media_type_slug: string
    media_type_name: string
    width: number
    height: number
    quantity: number
    print_size: string | null
    images: { storage_path: string; filename: string } | null
  }[]
}

interface ActiveBatchRecord {
  id: string
  status: string
  media_type_slug: string
  roll_width_in: number
  estimated_length_in: number | null
  error_message: string | null
  order_ids: string[]
  created_at: string
}

export default async function PrintQueuePage() {
  const supabase = await createClient()
  if (!supabase) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-zinc-500">Service unavailable.</p>
      </div>
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?returnTo=/admin/print-queue')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/')
  }

  // Fetch verified orders (ready for batching)
  const { data: verifiedOrders } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      total,
      created_at,
      print_notes,
      print_batch_id,
      profiles!inner (full_name),
      order_items (
        id,
        media_type_slug,
        media_type_name,
        width,
        height,
        quantity,
        print_size,
        images (storage_path, filename)
      )
    `)
    .eq('status', 'verified')
    .order('created_at', { ascending: true })

  // Fetch active/recent batches for status display
  const { data: activeBatches } = await supabase
    .from('print_batches')
    .select('*')
    .in('status', ['queued', 'submitted', 'printing', 'failed'])
    .order('created_at', { ascending: false })
    .limit(20)

  const formattedOrders = ((verifiedOrders ?? []) as unknown as OrderForQueue[]).map(
    (order) => {
      const prof = Array.isArray(order.profiles)
        ? order.profiles[0]
        : order.profiles
      return {
        id: order.id,
        customerName: prof?.full_name || 'Unknown',
        total: Number(order.total),
        createdAt: order.created_at,
        printNotes: order.print_notes,
        items: (order.order_items ?? []).map((item) => ({
          id: item.id,
          mediaTypeSlug: item.media_type_slug,
          mediaTypeName: item.media_type_name,
          width: item.width,
          height: item.height,
          quantity: item.quantity,
          printSize: item.print_size,
          imageFilename: item.images?.filename ?? 'Unknown',
          storagePath: item.images?.storage_path ?? '',
        })),
      }
    }
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/admin/orders"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Admin
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
          Print Queue
        </h1>
        <p className="mt-2 text-zinc-600">
          {formattedOrders.length} verified order{formattedOrders.length !== 1 ? 's' : ''} ready for batching
        </p>
      </div>

      <PrintQueueClient
        orders={formattedOrders}
        activeBatches={(activeBatches ?? []) as ActiveBatchRecord[]}
      />
    </div>
  )
}
