import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, History } from 'lucide-react'
import PrintQueueClient from './PrintQueueClient'

// Spec §14 Phase 4 / OQ-3: laptop can sleep, so we allow 4 hours in
// `submitted` before flagging a batch as stuck (not the 2 hours the spec
// originally suggested).
const STALE_BATCH_HOURS = 4

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
  updated_at: string
}

export default async function PrintQueuePage() {
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

  // Stale batch detection (§14 Phase 4). A batch stuck in `submitted` longer
  // than 4 hours means the print agent never picked it up — either the
  // workstation is asleep, the daemon is down, or Realtime and the fallback
  // poll both failed. Surface these as a warning at the top of the queue page.
  const activeBatchRecords = (activeBatches ?? []) as ActiveBatchRecord[]
  const staleThreshold = Date.now() - STALE_BATCH_HOURS * 60 * 60 * 1000
  const staleBatchIds = activeBatchRecords
    .filter(
      (b) => b.status === 'submitted' && new Date(b.updated_at).getTime() < staleThreshold
    )
    .map((b) => b.id)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <Link
          href="/admin/print-queue/history"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <History className="h-4 w-4" />
          Print History
        </Link>
      </div>

      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Admin
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          Print Queue
        </h1>
        <p className="mt-2 text-muted-foreground">
          {formattedOrders.length} verified order{formattedOrders.length !== 1 ? 's' : ''} ready for batching
        </p>
      </div>

      <PrintQueueClient
        orders={formattedOrders}
        activeBatches={activeBatchRecords}
        staleBatchIds={staleBatchIds}
        staleThresholdHours={STALE_BATCH_HOURS}
      />
    </div>
  )
}
