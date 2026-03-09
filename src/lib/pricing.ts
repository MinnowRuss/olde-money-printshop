// ============================================================
// Pricing Engine — pure functions, no side effects
// ============================================================

import type { PriceTier, MediaOption, VolumeDiscount } from '@/lib/constants/products'
import { VOLUME_DISCOUNTS } from '@/lib/constants/products'

export interface PriceInput {
  width: number       // inches
  height: number      // inches
  priceTiers: PriceTier[]
  selectedOptions: MediaOption[]
  quantity: number
}

export interface PriceResult {
  basePrice: number
  optionsCost: number
  unitPrice: number
  subtotal: number
  discountPct: number
  discountAmount: number
  total: number
  matchedTier: PriceTier | null
}

/**
 * Find the volume discount percentage for a given quantity.
 */
export function getVolumeDiscount(quantity: number, discounts: VolumeDiscount[] = VOLUME_DISCOUNTS): number {
  for (let i = discounts.length - 1; i >= 0; i--) {
    if (quantity >= discounts[i].minQty) {
      return discounts[i].discountPct
    }
  }
  return 0
}

/**
 * Find the matching price tier for the given dimensions.
 * Checks if width and height fit within any tier's range.
 * Also checks the reverse (height×width) to handle portrait vs landscape.
 */
export function findPriceTier(
  width: number,
  height: number,
  tiers: PriceTier[]
): PriceTier | null {
  // Normalize so the larger dimension is "width" for matching
  const w = Math.max(width, height)
  const h = Math.min(width, height)

  for (const tier of tiers) {
    const tierW = Math.max(tier.maxWidth, tier.maxHeight)
    const tierH = Math.min(tier.minWidth, tier.minHeight)

    if (w <= tierW && h >= tierH && w >= Math.min(tier.minWidth, tier.minHeight)) {
      return tier
    }
  }

  // Fallback: find the closest tier by checking both dimensions fit
  for (const tier of tiers) {
    if (
      width >= tier.minWidth &&
      width <= tier.maxWidth &&
      height >= tier.minHeight &&
      height <= tier.maxHeight
    ) {
      return tier
    }
  }

  // Try swapped dimensions (portrait orientation)
  for (const tier of tiers) {
    if (
      height >= tier.minWidth &&
      height <= tier.maxWidth &&
      width >= tier.minHeight &&
      width <= tier.maxHeight
    ) {
      return tier
    }
  }

  return null
}

/**
 * Calculate the total price for a print order.
 * Pure function — no database calls, no side effects.
 */
export function calculatePrice(input: PriceInput): PriceResult {
  const { width, height, priceTiers, selectedOptions, quantity } = input

  // 1. Find matching price tier
  const matchedTier = findPriceTier(width, height, priceTiers)

  if (!matchedTier) {
    return {
      basePrice: 0,
      optionsCost: 0,
      unitPrice: 0,
      subtotal: 0,
      discountPct: 0,
      discountAmount: 0,
      total: 0,
      matchedTier: null,
    }
  }

  // 2. Base price from tier
  const basePrice = Number(matchedTier.basePrice)

  // 3. Sum options extra costs
  const optionsCost = selectedOptions.reduce(
    (sum, opt) => sum + Number(opt.extraCost),
    0
  )

  // 4. Unit price = base + options
  const unitPrice = round(basePrice + optionsCost)

  // 5. Subtotal before discount
  const subtotal = round(unitPrice * quantity)

  // 6. Volume discount
  const discountPct = getVolumeDiscount(quantity)
  const discountAmount = round(subtotal * (discountPct / 100))

  // 7. Total after discount
  const total = round(subtotal - discountAmount)

  return {
    basePrice,
    optionsCost,
    unitPrice,
    subtotal,
    discountPct,
    discountAmount,
    total,
    matchedTier,
  }
}

/** Round to 2 decimal places */
function round(n: number): number {
  return Math.round(n * 100) / 100
}
