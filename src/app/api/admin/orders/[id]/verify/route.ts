import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * PATCH /api/admin/orders/[id]/verify
 *
 * Verifies a single order. Sets status = 'verified', verified_at, verified_by.
 * Only orders in 'processing' status (without print_notes flag) can be verified.
 *
 * Spec Ref: §4.1 / §6
 */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params

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

  // Fetch current order
  const { data: order, error: fetchError } = await serviceClient
    .from('orders')
    .select('id, status, print_notes')
    .eq('id', orderId)
    .single()

  if (fetchError || !order) {
    return NextResponse.json({ message: 'Order not found' }, { status: 404 })
  }

  if (order.status !== 'processing') {
    return NextResponse.json(
      { message: `Cannot verify an order in '${order.status}' status. Only 'processing' orders can be verified.` },
      { status: 409 }
    )
  }

  const { data: updated, error: updateError } = await serviceClient
    .from('orders')
    .update({
      status: 'verified',
      verified_at: new Date().toISOString(),
      verified_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single()

  if (updateError || !updated) {
    console.error('Failed to verify order:', updateError)
    return NextResponse.json({ message: 'Failed to verify order' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Order verified', order: updated })
}
