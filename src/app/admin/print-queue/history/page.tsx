import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Ruler,
  Calendar,
  Package,
} from 'lucide-react'

/**
 * /admin/print-queue/history
 *
 * Print batch audit log + paper usage reporting.
 *
 * Spec Ref: §14 Phase 4 — hardening & monitoring
 *
 * Shows:
 *  - Paper usage (this week, this month, all time) in linear and square feet
 *  - Paginated log of completed/failed batches with timestamps, item counts,
 *    waste %, and error messages for failures
 */

const PAGE_SIZE = 30

interface BatchHistoryRow {
  id: string
  status: string
  media_type_slug: string
  roll_width_in: number
  estimated_length_in: number | null
  order_ids: string[]
  error_message: string | null
  completed_at: string | null
  created_at: string
}

interface UsageRow {
  roll_width_in: number
  estimated_length_in: number | null
  completed_at: string | null
}

// Sum linear inches from completed batches. Returns linear feet and square feet
// (roll width × length), rounded to whole numbers for display.
function summarizeUsage(rows: UsageRow[]) {
  let linearIn = 0
  let squareIn = 0
  for (const r of rows) {
    const length = Number(r.estimated_length_in ?? 0)
    const width = Number(r.roll_width_in ?? 0)
    linearIn += length
    squareIn += length * width
  }
  return {
    linearFt: Math.round(linearIn / 12),
    squareFt: Math.round(squareIn / 144),
    batchCount: rows.length,
  }
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default async function PrintBatchHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(0, Number(pageParam ?? 0))
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

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
    redirect('/auth/login?returnTo=/admin/print-queue/history')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/')
  }

  // ── Paper usage windows ──────────────────────────────────────
  const now = Date.now()
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [weekResult, monthResult, allTimeResult] = await Promise.all([
    supabase
      .from('print_batches')
      .select('roll_width_in, estimated_length_in, completed_at')
      .eq('status', 'completed')
      .gte('completed_at', sevenDaysAgo),
    supabase
      .from('print_batches')
      .select('roll_width_in, estimated_length_in, completed_at')
      .eq('status', 'completed')
      .gte('completed_at', thirtyDaysAgo),
    supabase
      .from('print_batches')
      .select('roll_width_in, estimated_length_in, completed_at')
      .eq('status', 'completed'),
  ])

  const weekUsage = summarizeUsage((weekResult.data ?? []) as UsageRow[])
  const monthUsage = summarizeUsage((monthResult.data ?? []) as UsageRow[])
  const allTimeUsage = summarizeUsage((allTimeResult.data ?? []) as UsageRow[])

  // ── Paginated batch list ────────────────────────────────────
  const {
    data: batches,
    error: batchesError,
    count,
  } = await supabase
    .from('print_batches')
    .select(
      `id, status, media_type_slug, roll_width_in, estimated_length_in,
       order_ids, error_message, completed_at, created_at`,
      { count: 'exact' }
    )
    .in('status', ['completed', 'failed'])
    .order('created_at', { ascending: false })
    .range(from, to)

  if (batchesError) {
    console.error('Failed to fetch batch history:', batchesError)
  }

  const totalBatches = count ?? 0
  const totalPages = Math.ceil(totalBatches / PAGE_SIZE)
  const rows = (batches ?? []) as BatchHistoryRow[]

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/admin/print-queue"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Print Queue
      </Link>

      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Admin
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          Print History
        </h1>
        <p className="mt-2 text-muted-foreground">
          Paper usage and past batches
        </p>
      </div>

      {/* Paper usage cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <UsageCard label="Last 7 days" usage={weekUsage} />
        <UsageCard label="Last 30 days" usage={monthUsage} />
        <UsageCard label="All time" usage={allTimeUsage} />
      </div>

      {/* Batch history */}
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-foreground">Past batches</h2>
        <span className="text-sm text-muted-foreground">
          {totalBatches} total{totalPages > 1 && ` · Page ${page + 1} of ${totalPages}`}
        </span>
      </div>

      {rows.length === 0 ? (
        <Card className="p-10 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No completed or failed batches yet.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-border">
            {rows.map((batch) => (
              <BatchHistoryRow key={batch.id} batch={batch} />
            ))}
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          {page > 0 ? (
            <Link href={`/admin/print-queue/history?page=${page - 1}`}>
              <Button variant="outline" size="sm">
                Previous
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          {page < totalPages - 1 ? (
            <Link href={`/admin/print-queue/history?page=${page + 1}`}>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────

function UsageCard({
  label,
  usage,
}: {
  label: string
  usage: { linearFt: number; squareFt: number; batchCount: number }
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Ruler className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums text-foreground">
        {usage.linearFt.toLocaleString()}
        <span className="ml-1 text-lg font-normal text-muted-foreground">
          linear ft
        </span>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {usage.squareFt.toLocaleString()} sq ft · {usage.batchCount} batch
        {usage.batchCount === 1 ? '' : 'es'}
      </p>
    </Card>
  )
}

function BatchHistoryRow({ batch }: { batch: BatchHistoryRow }) {
  const isFailed = batch.status === 'failed'
  const Icon = isFailed ? XCircle : CheckCircle2
  const iconColor = isFailed ? 'text-red-500' : 'text-emerald-500'
  const lengthFt = batch.estimated_length_in
    ? Math.round(Number(batch.estimated_length_in) / 12)
    : null
  const orderCount = batch.order_ids?.length ?? 0

  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconColor}`} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-foreground">
              #{batch.id.slice(0, 8).toUpperCase()}
            </span>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {batch.media_type_slug} · {batch.roll_width_in}&quot; roll
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created {formatDateTime(batch.created_at)}
            </span>
            {batch.completed_at && (
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Finished {formatDateTime(batch.completed_at)}
              </span>
            )}
            <span>
              {orderCount} order{orderCount === 1 ? '' : 's'}
            </span>
            {lengthFt !== null && <span>{lengthFt} ft used</span>}
          </div>
          {isFailed && batch.error_message && (
            <div className="mt-2 flex items-start gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{batch.error_message}</span>
            </div>
          )}
        </div>
      </div>
      <span
        className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          isFailed
            ? 'bg-red-100 text-red-700'
            : 'bg-emerald-100 text-emerald-800'
        }`}
      >
        {isFailed ? 'Failed' : 'Completed'}
      </span>
    </div>
  )
}
