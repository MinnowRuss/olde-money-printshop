import { NextRequest, NextResponse } from 'next/server'
import { MEDIA_TYPES } from '@/lib/constants/products'
import { calculatePrice } from '@/lib/pricing'

/**
 * GET /api/calculator
 *
 * Query params:
 *   media_id  — media type slug (e.g. "canvas-wrap")
 *   width     — print width in inches
 *   height    — print height in inches
 *   options[] — array of option slugs (optional, repeatable)
 *   quantity  — number of prints (default: 1)
 *
 * Returns pricing breakdown or error.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  // 1. Parse required params
  const mediaId = searchParams.get('media_id')
  const widthStr = searchParams.get('width')
  const heightStr = searchParams.get('height')
  const quantity = parseInt(searchParams.get('quantity') ?? '1', 10)
  const optionSlugs = searchParams.getAll('options[]')

  if (!mediaId) {
    return NextResponse.json(
      { error: 'Missing required parameter: media_id' },
      { status: 400 }
    )
  }

  if (!widthStr || !heightStr) {
    return NextResponse.json(
      { error: 'Missing required parameters: width and height (in inches)' },
      { status: 400 }
    )
  }

  const width = parseFloat(widthStr)
  const height = parseFloat(heightStr)

  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
    return NextResponse.json(
      { error: 'Width and height must be positive numbers' },
      { status: 400 }
    )
  }

  if (isNaN(quantity) || quantity < 1) {
    return NextResponse.json(
      { error: 'Quantity must be a positive integer' },
      { status: 400 }
    )
  }

  // 2. Find media type
  const mediaType = MEDIA_TYPES.find((m) => m.slug === mediaId)
  if (!mediaType) {
    return NextResponse.json(
      { error: `Unknown media type: ${mediaId}` },
      { status: 404 }
    )
  }

  // 3. Resolve selected options
  const selectedOptions = optionSlugs
    .map((slug) => mediaType.options.find((o) => o.slug === slug))
    .filter((o) => o !== undefined)

  // 4. Calculate price
  const result = calculatePrice({
    width,
    height,
    priceTiers: mediaType.priceTiers,
    selectedOptions,
    quantity,
  })

  if (!result.matchedTier) {
    return NextResponse.json(
      {
        error: `No pricing available for ${width}×${height}" ${mediaType.name}. Try a different size.`,
      },
      { status: 400 }
    )
  }

  // 5. Return price breakdown
  return NextResponse.json({
    media_type: mediaType.name,
    media_slug: mediaType.slug,
    size: result.matchedTier.label,
    width,
    height,
    unit_price: result.unitPrice,
    total_price: result.total,
    volume_discount_pct: result.discountPct,
    volume_discount_amount: result.discountAmount,
    subtotal: result.subtotal,
    quantity,
    options_applied: selectedOptions.map((o) => ({
      name: o.name,
      slug: o.slug,
      extra_cost: o.extraCost,
    })),
  })
}
