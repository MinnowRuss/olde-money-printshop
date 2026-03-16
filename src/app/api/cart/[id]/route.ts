import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MEDIA_TYPES } from '@/lib/constants/products'
import { calculatePrice } from '@/lib/pricing'

/**
 * PATCH /api/cart/[id]
 *
 * Updates the quantity of a cart item and recalculates pricing server-side.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { quantity } = body as Record<string, any>

  if (typeof quantity !== 'number' || quantity < 1 || !Number.isInteger(quantity)) {
    return NextResponse.json({ message: 'Quantity must be a positive integer' }, { status: 400 })
  }

  // Fetch current cart item (RLS ensures user can only see their own)
  const { data: cartItem, error: fetchError } = await supabase
    .from('cart_items')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !cartItem) {
    return NextResponse.json({ message: 'Cart item not found' }, { status: 404 })
  }

  // Re-calculate price server-side with the new quantity
  const mediaType = MEDIA_TYPES.find((m) => m.slug === cartItem.media_type_slug)
  if (!mediaType) {
    return NextResponse.json({ message: 'Unknown media type' }, { status: 400 })
  }

  const resolvedOptionSlugs: string[] = Array.isArray(cartItem.option_slugs)
    ? cartItem.option_slugs
    : []
  const selectedOptions = resolvedOptionSlugs
    .map((slug: string) => mediaType.options.find((o) => o.slug === slug))
    .filter((o) => o !== undefined)

  const priceResult = calculatePrice({
    width: cartItem.width,
    height: cartItem.height,
    priceTiers: mediaType.priceTiers,
    selectedOptions,
    quantity,
  })

  // Update cart item
  const { data: updated, error: updateError } = await supabase
    .from('cart_items')
    .update({
      quantity,
      unit_price: priceResult.unitPrice,
      discount_pct: priceResult.discountPct,
      discount_amount: priceResult.discountAmount,
      total: priceResult.total,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (updateError) {
    console.error('Failed to update cart item:', updateError)
    return NextResponse.json({ message: 'Failed to update cart item' }, { status: 500 })
  }

  return NextResponse.json(updated)
}

/**
 * DELETE /api/cart/[id]
 *
 * Removes a cart item.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to delete cart item:', error)
    return NextResponse.json({ message: 'Failed to remove item' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
