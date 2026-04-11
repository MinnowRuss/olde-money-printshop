import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { nestItems, type NestingItem } from '@/lib/nesting/nesting-engine'

interface OrderItemImageRecord {
  storage_path: string
}

interface OrderItemRecord {
  id: string
  order_id: string
  width: number
  height: number
  quantity: number
  media_type_slug: string
  images: OrderItemImageRecord | OrderItemImageRecord[] | null
}

/**
 * POST /api/admin/print-batches
 *
 * Creates a print batch from verified orders:
 * 1. Runs NFDH nesting engine on order items
 * 2. Persists batch with manifest to DB
 * 3. Advances orders to 'queued' status
 *
 * Spec Ref: §6
 */
export async function POST(request: NextRequest) {
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

  // Parse request
  let body: {
    orderIds: string[]
    rollWidthIn: number
    mediaTypeSlug: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  const { orderIds, rollWidthIn, mediaTypeSlug } = body

  if (!orderIds?.length || !rollWidthIn || !mediaTypeSlug) {
    return NextResponse.json(
      { message: 'orderIds, rollWidthIn, and mediaTypeSlug are required' },
      { status: 400 }
    )
  }

  const serviceClient = createServiceClient()
  if (!serviceClient) {
    return NextResponse.json({ message: 'Service unavailable' }, { status: 503 })
  }

  // Fetch order items for the given orders + media type
  const { data: orderItems, error: itemsError } = await serviceClient
    .from('order_items')
    .select(`
      id,
      order_id,
      width,
      height,
      quantity,
      media_type_slug,
      images (storage_path)
    `)
    .in('order_id', orderIds)
    .eq('media_type_slug', mediaTypeSlug)

  if (itemsError) {
    console.error('Failed to fetch order items:', itemsError)
    return NextResponse.json({ message: 'Failed to fetch order items' }, { status: 500 })
  }

  if (!orderItems || orderItems.length === 0) {
    return NextResponse.json(
      { message: 'No matching order items found for the given orders and media type' },
      { status: 400 }
    )
  }

  // Build nesting input
  const nestingInput: NestingItem[] = (orderItems as OrderItemRecord[]).map((item) => {
    const image = Array.isArray(item.images) ? item.images[0] : item.images

    return {
    orderItemId: item.id,
    orderId: item.order_id,
    widthIn: item.width,
    heightIn: item.height,
    quantity: item.quantity,
    imageStoragePath: image?.storage_path ?? '',
    }
  })

  // Run nesting engine
  const nestingResult = nestItems(nestingInput, rollWidthIn)

  // Insert batch record
  const { data: batch, error: batchError } = await serviceClient
    .from('print_batches')
    .insert({
      batch_date: new Date().toISOString().split('T')[0],
      media_type_slug: mediaTypeSlug,
      roll_width_in: rollWidthIn,
      status: 'queued',
      order_ids: orderIds,
      manifest: nestingResult,
      estimated_length_in: nestingResult.totalLengthIn,
      created_by: user.id,
    })
    .select()
    .single()

  if (batchError || !batch) {
    console.error('Failed to create batch:', batchError)
    return NextResponse.json({ message: 'Failed to create batch' }, { status: 500 })
  }

  // Advance orders to 'queued' and link to batch
  const { error: updateError } = await serviceClient
    .from('orders')
    .update({
      status: 'queued',
      print_batch_id: batch.id,
      updated_at: new Date().toISOString(),
    })
    .in('id', orderIds)

  if (updateError) {
    console.error('Failed to update orders:', updateError)
    // Batch was created — don't fail completely, but warn
  }

  return NextResponse.json({
    batchId: batch.id,
    status: batch.status,
    itemCount: nestingResult.placements.length,
    estimatedLengthIn: nestingResult.totalLengthIn,
    wastePercent: nestingResult.wastePercent,
    stripCount: nestingResult.strips.length,
    rollWidthIn: nestingResult.rollWidthIn,
    placements: nestingResult.placements,
  })
}
