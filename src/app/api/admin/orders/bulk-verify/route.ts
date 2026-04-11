import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * POST /api/admin/orders/bulk-verify
 *
 * Bulk-verifies multiple orders by ID. Only 'processing' orders are updated.
 * Returns count of verified and skipped orders.
 *
 * Spec Ref: §4.1 / §6
 */
export async function POST(request: NextRequest) {
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

  let body: { orderIds: string[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.orderIds?.length) {
    return NextResponse.json({ message: 'orderIds array is required' }, { status: 400 })
  }

  const serviceClient = createServiceClient()
  if (!serviceClient) {
    return NextResponse.json({ message: 'Service unavailable' }, { status: 503 })
  }

  // Only update orders that are in 'processing' status and not flagged
  const { data: updated, error } = await serviceClient
    .from('orders')
    .update({
      status: 'verified',
      verified_at: new Date().toISOString(),
      verified_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .in('id', body.orderIds)
    .eq('status', 'processing')
    .is('print_notes', null)
    .select('id')

  if (error) {
    console.error('Bulk verify failed:', error)
    return NextResponse.json({ message: 'Failed to verify orders' }, { status: 500 })
  }

  const verifiedCount = updated?.length ?? 0
  const skippedCount = body.orderIds.length - verifiedCount

  return NextResponse.json({
    message: `${verifiedCount} order(s) verified, ${skippedCount} skipped`,
    verifiedCount,
    skippedCount,
    verifiedIds: updated?.map((o) => o.id) ?? [],
  })
}
