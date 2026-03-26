import { describe, it, expect } from 'vitest'
import { nestItems, type NestingItem } from './nesting-engine'

function makeItem(
  overrides: Partial<NestingItem> & { widthIn: number; heightIn: number }
): NestingItem {
  return {
    orderItemId: overrides.orderItemId ?? 'item-1',
    orderId: overrides.orderId ?? 'order-1',
    widthIn: overrides.widthIn,
    heightIn: overrides.heightIn,
    quantity: overrides.quantity ?? 1,
    imageStoragePath: overrides.imageStoragePath ?? 'path/to/image.jpg',
  }
}

// ── Empty input ──────────────────────────────────────────────

describe('nestItems — empty input', () => {
  it('returns empty result for no items', () => {
    const result = nestItems([], 44)
    expect(result.placements).toEqual([])
    expect(result.strips).toEqual([])
    expect(result.totalLengthIn).toBe(0)
    expect(result.wastePercent).toBe(0)
    expect(result.rollWidthIn).toBe(44)
  })
})

// ── Single item ──────────────────────────────────────────────

describe('nestItems — single item', () => {
  it('places a single item at origin', () => {
    const items = [makeItem({ widthIn: 10, heightIn: 8 })]
    const result = nestItems(items, 44)

    expect(result.placements).toHaveLength(1)
    expect(result.placements[0].x).toBe(0)
    expect(result.placements[0].y).toBe(0)
    expect(result.placements[0].widthIn).toBe(10)
    expect(result.placements[0].heightIn).toBe(8)
    expect(result.placements[0].rotation).toBe(0)
    expect(result.strips).toHaveLength(1)
    expect(result.totalLengthIn).toBe(8)
  })

  it('rotates a wide item to fit the roll', () => {
    // Item is 50" wide but only 10" tall → won't fit on 44" roll
    // After rotation: 10" wide, 50" tall → fits width
    const items = [makeItem({ widthIn: 50, heightIn: 10 })]
    const result = nestItems(items, 44)

    expect(result.placements).toHaveLength(1)
    expect(result.placements[0].rotation).toBe(90)
    expect(result.placements[0].widthIn).toBe(10)
    expect(result.placements[0].heightIn).toBe(50)
  })

  it('skips items that exceed roll width even after rotation', () => {
    const items = [makeItem({ widthIn: 50, heightIn: 50 })]
    const result = nestItems(items, 44)

    expect(result.placements).toHaveLength(0)
    expect(result.totalLengthIn).toBe(0)
  })
})

// ── Quantity expansion ───────────────────────────────────────

describe('nestItems — quantity expansion', () => {
  it('expands quantity into individual placements', () => {
    const items = [makeItem({ widthIn: 8, heightIn: 10, quantity: 3 })]
    const result = nestItems(items, 44)

    expect(result.placements).toHaveLength(3)
    // All should be on the same strip since 3×8 + 2×0.25 gutter = 24.5 < 44
    expect(result.strips).toHaveLength(1)
  })
})

// ── Multiple items packing ───────────────────────────────────

describe('nestItems — strip packing', () => {
  it('packs items left-to-right in a strip', () => {
    const items = [
      makeItem({ orderItemId: 'a', widthIn: 10, heightIn: 8 }),
      makeItem({ orderItemId: 'b', widthIn: 12, heightIn: 6 }),
    ]
    const result = nestItems(items, 44)

    // Sorted by height desc: a(8) then b(6)
    expect(result.placements[0].orderItemId).toBe('a')
    expect(result.placements[0].x).toBe(0)
    expect(result.placements[1].orderItemId).toBe('b')
    expect(result.placements[1].x).toBe(10.25) // 10 + 0.25 gutter
    // Both fit on one strip
    expect(result.strips).toHaveLength(1)
    // Strip height = tallest item = 8
    expect(result.strips[0].height).toBe(8)
  })

  it('opens a new strip when items overflow the roll width', () => {
    const items = [
      makeItem({ orderItemId: 'a', widthIn: 20, heightIn: 10 }),
      makeItem({ orderItemId: 'b', widthIn: 20, heightIn: 8 }),
      makeItem({ orderItemId: 'c', widthIn: 20, heightIn: 6 }),
    ]
    const result = nestItems(items, 44)

    // a(20) + b(20) + gutter = 40.25 < 44 → both fit in strip 1
    // c(20) → 40.25 + 20 + 0.25 = 60.5 > 44 → new strip
    expect(result.strips).toHaveLength(2)
    expect(result.strips[0].items).toHaveLength(2)
    expect(result.strips[1].items).toHaveLength(1)
  })
})

// ── Gutter spacing ───────────────────────────────────────────

describe('nestItems — gutter', () => {
  it('applies 0.25" gutter between items', () => {
    const items = [
      makeItem({ orderItemId: 'a', widthIn: 10, heightIn: 5 }),
      makeItem({ orderItemId: 'b', widthIn: 10, heightIn: 5 }),
    ]
    const result = nestItems(items, 44)

    expect(result.placements[0].x).toBe(0)
    expect(result.placements[1].x).toBe(10.25)
  })

  it('applies 0.25" gutter between strips', () => {
    // Force two strips by using large items
    const items = [
      makeItem({ orderItemId: 'a', widthIn: 40, heightIn: 10 }),
      makeItem({ orderItemId: 'b', widthIn: 40, heightIn: 8 }),
    ]
    const result = nestItems(items, 44)

    expect(result.strips).toHaveLength(2)
    expect(result.strips[0].yStart).toBe(0)
    expect(result.strips[1].yStart).toBe(10.25) // 10 + 0.25 gutter
  })
})

// ── Total length & waste calculation ─────────────────────────

describe('nestItems — metrics', () => {
  it('calculates total length correctly', () => {
    const items = [makeItem({ widthIn: 10, heightIn: 8 })]
    const result = nestItems(items, 44)

    expect(result.totalLengthIn).toBe(8)
  })

  it('calculates waste percentage', () => {
    // Single item: 10×8 = 80 sq in on a 44×8 = 352 sq in sheet
    // Waste = (352 - 80) / 352 = 77.27%
    const items = [makeItem({ widthIn: 10, heightIn: 8 })]
    const result = nestItems(items, 44)

    expect(result.wastePercent).toBeGreaterThan(70)
    expect(result.wastePercent).toBeLessThan(80)
  })

  it('reports rollWidthIn in result', () => {
    const result = nestItems([], 36)
    expect(result.rollWidthIn).toBe(36)
  })
})

// ── Sorting by height descending ─────────────────────────────

describe('nestItems — NFDH sort order', () => {
  it('sorts items by height descending before packing', () => {
    const items = [
      makeItem({ orderItemId: 'short', widthIn: 10, heightIn: 4 }),
      makeItem({ orderItemId: 'tall', widthIn: 10, heightIn: 12 }),
      makeItem({ orderItemId: 'mid', widthIn: 10, heightIn: 8 }),
    ]
    const result = nestItems(items, 44)

    // Should be placed in order: tall, mid, short
    expect(result.placements[0].orderItemId).toBe('tall')
    expect(result.placements[1].orderItemId).toBe('mid')
    expect(result.placements[2].orderItemId).toBe('short')
  })
})

// ── Different roll widths ────────────────────────────────────

describe('nestItems — roll width variations', () => {
  it('works with 24" roll', () => {
    const items = [
      makeItem({ widthIn: 20, heightIn: 16 }),
      makeItem({ widthIn: 20, heightIn: 12 }),
    ]
    const result = nestItems(items, 24)

    // Each item is 20" wide; only one fits per strip on a 24" roll
    expect(result.strips).toHaveLength(2)
  })

  it('works with 36" roll', () => {
    const items = [
      makeItem({ widthIn: 16, heightIn: 12 }),
      makeItem({ widthIn: 16, heightIn: 10 }),
    ]
    const result = nestItems(items, 36)

    // 16 + 0.25 + 16 = 32.25 < 36 → both fit on one strip
    expect(result.strips).toHaveLength(1)
  })
})
