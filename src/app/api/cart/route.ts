import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MEDIA_TYPES } from '@/lib/constants/products'
import { calculatePrice } from '@/lib/pricing'

/**
 * POST /api/cart
 *
 * Adds an item to the user's cart. Recalculates price server-side.
 *
 * Body:
 *   imageId      — UUID of the image
 *   cropData     — { x, y, width, height, unit, aspect? }
 *   finishData   — { mediaSlug, width, height, quantity, optionSlugs[] }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ message: 'Service unavailable' }, { status: 503 })
  }

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  // Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { imageId, cropData, finishData } = body as Record<string, any>

  // Validate required fields
  if (!imageId || typeof imageId !== 'string') {
    return NextResponse.json({ message: 'Missing or invalid imageId' }, { status: 400 })
  }

  if (!cropData || typeof cropData !== 'object') {
    return NextResponse.json({ message: 'Missing or invalid cropData' }, { status: 400 })
  }

  if (!finishData || typeof finishData !== 'object') {
    return NextResponse.json({ message: 'Missing or invalid finishData' }, { status: 400 })
  }

  const { mediaSlug, width, height, quantity, optionSlugs } = finishData

  if (!mediaSlug || typeof mediaSlug !== 'string') {
    return NextResponse.json({ message: 'Missing or invalid mediaSlug' }, { status: 400 })
  }

  if (typeof width !== 'number' || width <= 0) {
    return NextResponse.json({ message: 'Width must be a positive number' }, { status: 400 })
  }

  if (typeof height !== 'number' || height <= 0) {
    return NextResponse.json({ message: 'Height must be a positive number' }, { status: 400 })
  }

  if (typeof quantity !== 'number' || quantity < 1 || !Number.isInteger(quantity)) {
    return NextResponse.json({ message: 'Quantity must be a positive integer' }, { status: 400 })
  }

  // Verify image belongs to user
  const { data: imageData, error: imageError } = await supabase
    .from('images')
    .select('id')
    .eq('id', imageId)
    .eq('user_id', user.id)
    .single()

  if (imageError || !imageData) {
    return NextResponse.json({ message: 'Image not found' }, { status: 404 })
  }

  // Find media type
  const mediaType = MEDIA_TYPES.find((m) => m.slug === mediaSlug)
  if (!mediaType) {
    return NextResponse.json({ message: `Unknown media type: ${mediaSlug}` }, { status: 400 })
  }

  // Resolve options
  const resolvedOptionSlugs: string[] = Array.isArray(optionSlugs) ? optionSlugs : []
  const selectedOptions = resolvedOptionSlugs
    .map((slug: string) => mediaType.options.find((o) => o.slug === slug))
    .filter((o) => o !== undefined)

  // Server-side price calculation (never trust client-sent price)
  const priceResult = calculatePrice({
    width,
    height,
    priceTiers: mediaType.priceTiers,
    selectedOptions,
    quantity,
  })

  if (!priceResult.matchedTier) {
    return NextResponse.json(
      { message: `No pricing available for ${width}x${height}" ${mediaType.name}` },
      { status: 400 }
    )
  }

  // Insert into cart_items
  const { data: cartItem, error: insertError } = await supabase
    .from('cart_items')
    .insert({
      user_id: user.id,
      image_id: imageId,
      media_type_slug: mediaSlug,
      media_type_name: mediaType.name,
      width,
      height,
      print_size: priceResult.matchedTier.label,
      crop_data: cropData,
      option_slugs: resolvedOptionSlugs,
      option_names: selectedOptions.map((o) => o.name),
      quantity,
      unit_price: priceResult.unitPrice,
      discount_pct: priceResult.discountPct,
      discount_amount: priceResult.discountAmount,
      total: priceResult.total,
    })
    .select()
    .single()

  if (insertError) {
    console.error('Failed to insert cart item:', insertError)
    return NextResponse.json(
      { message: 'Failed to add item to cart' },
      { status: 500 }
    )
  }

  return NextResponse.json(cartItem, { status: 201 })
}

/**
 * GET /api/cart
 *
 * Returns the count of items in the current user's cart.
 */
export async function GET() {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ count: 0 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ count: 0 })
  }

  const { count, error } = await supabase
    .from('cart_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ count: 0 })
  }

  return NextResponse.json({ count: count ?? 0 })
}
