import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * POST /api/admin/print-batches/[id]/submit
 *
 * Atomically transitions a batch from 'queued' to 'submitted'.
 * Uses a row-level lock to prevent concurrent submissions.
 * This triggers the print agent via Supabase Realtime.
 *
 * AC-4.2.1: Concurrent requests for same batch ID rejected after first succeeds.
 * AC-4.2.2: queued → submitted transition is atomic under Postgres row lock.
 *
 * Spec Ref: §4.2, §6
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: batchId } = await params

  // Verify admin auth
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ message: 'Service unavailable' }, { status: 503 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const serviceClient = createServiceClient()
  if (!serviceClient) {
    return NextResponse.json({ message: 'Service unavailable' }, { status: 503 })
  }

  // Atomic update: only succeeds if status is currently 'queued'
  const { data: updated, error } = await serviceClient
    .from('print_batches')
    .update({
      status: 'submitted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', batchId)
    .eq('status', 'queued')
    .select()
    .single()

  if (error || !updated) {
    // Either batch not found or status wasn't 'queued' (already submitted)
    return NextResponse.json(
      { message: 'Batch not found or already submitted. Only queued batches can be submitted.' },
      { status: 409 }
    )
  }

  return NextResponse.json({
    batchId: updated.id,
    status: updated.status,
    message: 'Batch submitted to print queue',
  })
}
