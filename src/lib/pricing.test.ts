import { describe, it, expect } from 'vitest'
import { calculatePrice, getVolumeDiscount, findPriceTier } from './pricing'
import { MEDIA_TYPES, VOLUME_DISCOUNTS } from '@/lib/constants/products'

const standardPrint = MEDIA_TYPES.find((m) => m.slug === 'standard-print')!
const canvasWrap = MEDIA_TYPES.find((m) => m.slug === 'canvas-wrap')!
const metalPrint = MEDIA_TYPES.find((m) => m.slug === 'metal-print')!

// ----- getVolumeDiscount -----

describe('getVolumeDiscount', () => {
  it('returns 0% for 1–4 prints', () => {
    expect(getVolumeDiscount(1)).toBe(0)
    expect(getVolumeDiscount(4)).toBe(0)
  })

  it('returns 5% for 5–9 prints', () => {
    expect(getVolumeDiscount(5)).toBe(5)
    expect(getVolumeDiscount(9)).toBe(5)
  })

  it('returns 10% for 10–24 prints', () => {
    expect(getVolumeDiscount(10)).toBe(10)
    expect(getVolumeDiscount(24)).toBe(10)
  })

  it('returns 15% for 25+ prints', () => {
    expect(getVolumeDiscount(25)).toBe(15)
    expect(getVolumeDiscount(100)).toBe(15)
  })

  it('returns 0% for quantity 0', () => {
    expect(getVolumeDiscount(0)).toBe(0)
  })
})

// ----- findPriceTier -----

describe('findPriceTier', () => {
  it('finds correct tier for 8×10 standard print', () => {
    const tier = findPriceTier(8, 10, standardPrint.priceTiers)
    expect(tier).not.toBeNull()
    expect(tier!.basePrice).toBe(14.99)
  })

  it('finds correct tier for 16×20 canvas', () => {
    const tier = findPriceTier(16, 20, canvasWrap.priceTiers)
    expect(tier).not.toBeNull()
    expect(tier!.basePrice).toBe(99.99)
  })

  it('handles portrait orientation (10×8 = same as 8×10)', () => {
    const tier = findPriceTier(10, 8, standardPrint.priceTiers)
    expect(tier).not.toBeNull()
    expect(tier!.basePrice).toBe(14.99)
  })

  it('returns null for dimensions outside all tiers', () => {
    const tier = findPriceTier(100, 100, standardPrint.priceTiers)
    expect(tier).toBeNull()
  })

  it('finds smallest tier for small dimensions', () => {
    const tier = findPriceTier(4, 6, standardPrint.priceTiers)
    expect(tier).not.toBeNull()
    expect(tier!.basePrice).toBe(8.99)
  })
})

// ----- calculatePrice -----

describe('calculatePrice', () => {
  it('calculates correct price for basic standard print', () => {
    const result = calculatePrice({
      width: 8,
      height: 10,
      priceTiers: standardPrint.priceTiers,
      selectedOptions: [],
      quantity: 1,
    })

    expect(result.basePrice).toBe(14.99)
    expect(result.optionsCost).toBe(0)
    expect(result.unitPrice).toBe(14.99)
    expect(result.subtotal).toBe(14.99)
    expect(result.discountPct).toBe(0)
    expect(result.discountAmount).toBe(0)
    expect(result.total).toBe(14.99)
    expect(result.matchedTier).not.toBeNull()
  })

  it('adds options extra cost to unit price', () => {
    const matteOption = standardPrint.options.find((o) => o.slug === 'matte-finish')!
    const result = calculatePrice({
      width: 8,
      height: 10,
      priceTiers: standardPrint.priceTiers,
      selectedOptions: [matteOption],
      quantity: 1,
    })

    expect(result.optionsCost).toBe(2.0)
    expect(result.unitPrice).toBe(16.99)
    expect(result.total).toBe(16.99)
  })

  it('applies volume discount for 5 prints', () => {
    const result = calculatePrice({
      width: 8,
      height: 10,
      priceTiers: standardPrint.priceTiers,
      selectedOptions: [],
      quantity: 5,
    })

    expect(result.unitPrice).toBe(14.99)
    expect(result.subtotal).toBe(74.95)
    expect(result.discountPct).toBe(5)
    expect(result.discountAmount).toBe(3.75)
    expect(result.total).toBe(71.2)
  })

  it('applies 10% volume discount for 10 prints', () => {
    const result = calculatePrice({
      width: 16,
      height: 20,
      priceTiers: canvasWrap.priceTiers,
      selectedOptions: [],
      quantity: 10,
    })

    expect(result.unitPrice).toBe(99.99)
    expect(result.subtotal).toBe(999.9)
    expect(result.discountPct).toBe(10)
    expect(result.discountAmount).toBe(99.99)
    expect(result.total).toBe(899.91)
  })

  it('handles multiple options', () => {
    const thickWrap = canvasWrap.options.find((o) => o.slug === 'thick-wrap')!
    const mirrorEdge = canvasWrap.options.find((o) => o.slug === 'mirror-edge')!
    const result = calculatePrice({
      width: 16,
      height: 20,
      priceTiers: canvasWrap.priceTiers,
      selectedOptions: [thickWrap, mirrorEdge],
      quantity: 1,
    })

    expect(result.optionsCost).toBe(20.0)
    expect(result.unitPrice).toBe(119.99)
    expect(result.total).toBe(119.99)
  })

  it('returns zero result when no tier matches', () => {
    const result = calculatePrice({
      width: 100,
      height: 100,
      priceTiers: standardPrint.priceTiers,
      selectedOptions: [],
      quantity: 1,
    })

    expect(result.total).toBe(0)
    expect(result.matchedTier).toBeNull()
  })

  it('has no side effects — calling twice with same input gives same result', () => {
    const input = {
      width: 11,
      height: 14,
      priceTiers: metalPrint.priceTiers,
      selectedOptions: [],
      quantity: 3,
    }

    const result1 = calculatePrice(input)
    const result2 = calculatePrice(input)
    expect(result1).toEqual(result2)
  })

  it('calculates 25+ prints with 15% discount', () => {
    const result = calculatePrice({
      width: 8,
      height: 10,
      priceTiers: metalPrint.priceTiers,
      selectedOptions: [],
      quantity: 25,
    })

    expect(result.unitPrice).toBe(59.99)
    expect(result.subtotal).toBe(1499.75)
    expect(result.discountPct).toBe(15)
    expect(result.discountAmount).toBe(224.96)
    expect(result.total).toBe(1274.79)
  })
})
