/**
 * NFDH (Next Fit Decreasing Height) strip-packing nesting engine.
 *
 * Arranges print items on roll paper of a given width, minimizing
 * total paper length consumed. Pure function — no side effects.
 *
 * Spec Ref: §6
 */

/** Gutter between items on the roll (inches) */
const GUTTER_IN = 0.25

// ── Types ────────────────────────────────────────────────────

export interface NestingItem {
  orderItemId: string
  orderId: string
  widthIn: number
  heightIn: number
  quantity: number
  imageStoragePath: string
}

export interface PlacedItem {
  orderItemId: string
  orderId: string
  x: number
  y: number
  widthIn: number
  heightIn: number
  rotation: 0 | 90
  imageStoragePath: string
}

export interface Strip {
  yStart: number
  height: number
  items: PlacedItem[]
}

export interface NestingResult {
  placements: PlacedItem[]
  rollWidthIn: number
  totalLengthIn: number
  wastePercent: number
  strips: Strip[]
}

// ── Helpers ──────────────────────────────────────────────────

/** Expand items by quantity — each copy becomes its own placement candidate. */
function expandItems(items: NestingItem[]): NestingItem[] {
  const expanded: NestingItem[] = []
  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      expanded.push({ ...item, quantity: 1 })
    }
  }
  return expanded
}

// ── Main algorithm ───────────────────────────────────────────

/**
 * NFDH strip-packing algorithm:
 * 1. Expand items by quantity.
 * 2. Sort by height descending (decreasing height).
 * 3. Open a strip — its height equals the tallest item placed in it.
 * 4. Pack items left-to-right. If an item doesn't fit in width,
 *    try 90° rotation. If still doesn't fit, close the strip and
 *    open a new one.
 * 5. Return placements and total roll length.
 */
export function nestItems(
  items: NestingItem[],
  rollWidthIn: number
): NestingResult {
  if (items.length === 0) {
    return {
      placements: [],
      rollWidthIn,
      totalLengthIn: 0,
      wastePercent: 0,
      strips: [],
    }
  }

  const expanded = expandItems(items)

  // Sort by height descending (tallest first)
  expanded.sort((a, b) => b.heightIn - a.heightIn)

  const strips: Strip[] = []
  const placements: PlacedItem[] = []
  let totalUsedArea = 0

  let currentStrip: Strip = { yStart: 0, height: 0, items: [] }
  let cursorX = 0

  for (const item of expanded) {
    // Try to place at current position in current strip
    const placed = tryPlace(item, currentStrip, cursorX, rollWidthIn)

    if (placed) {
      currentStrip.items.push(placed)
      placements.push(placed)
      totalUsedArea += placed.widthIn * placed.heightIn
      // The strip height is the tallest item in it
      if (placed.heightIn > currentStrip.height) {
        currentStrip.height = placed.heightIn
      }
      cursorX += placed.widthIn + GUTTER_IN
    } else {
      // Close current strip (if it has items) and open a new one
      if (currentStrip.items.length > 0) {
        strips.push(currentStrip)
        const newYStart = currentStrip.yStart + currentStrip.height + GUTTER_IN
        currentStrip = { yStart: newYStart, height: 0, items: [] }
        cursorX = 0
      }

      // Place in the new strip
      const placedInNew = tryPlace(item, currentStrip, cursorX, rollWidthIn)
      if (placedInNew) {
        currentStrip.items.push(placedInNew)
        placements.push(placedInNew)
        totalUsedArea += placedInNew.widthIn * placedInNew.heightIn
        currentStrip.height = placedInNew.heightIn
        cursorX += placedInNew.widthIn + GUTTER_IN
      } else {
        // Item is wider than the roll even after rotation — skip it
        console.warn(
          `Item ${item.orderItemId} (${item.widthIn}×${item.heightIn}) exceeds roll width ${rollWidthIn} — skipped`
        )
      }
    }
  }

  // Close last strip
  if (currentStrip.items.length > 0) {
    strips.push(currentStrip)
  }

  const totalLengthIn =
    strips.length > 0
      ? strips[strips.length - 1].yStart + strips[strips.length - 1].height
      : 0

  const totalSheetArea = rollWidthIn * totalLengthIn
  const wastePercent =
    totalSheetArea > 0
      ? Math.round(((totalSheetArea - totalUsedArea) / totalSheetArea) * 10000) / 100
      : 0

  return {
    placements,
    rollWidthIn,
    totalLengthIn: Math.round(totalLengthIn * 100) / 100,
    wastePercent,
    strips,
  }
}

/** Try to place an item at the given x position, optionally rotating 90°. */
function tryPlace(
  item: NestingItem,
  strip: Strip,
  cursorX: number,
  rollWidthIn: number
): PlacedItem | null {
  // Try normal orientation
  if (cursorX + item.widthIn <= rollWidthIn) {
    return {
      orderItemId: item.orderItemId,
      orderId: item.orderId,
      x: cursorX,
      y: strip.yStart,
      widthIn: item.widthIn,
      heightIn: item.heightIn,
      rotation: 0,
      imageStoragePath: item.imageStoragePath,
    }
  }

  // Try 90° rotation (swap width/height)
  if (cursorX + item.heightIn <= rollWidthIn) {
    return {
      orderItemId: item.orderItemId,
      orderId: item.orderId,
      x: cursorX,
      y: strip.yStart,
      widthIn: item.heightIn,
      heightIn: item.widthIn,
      rotation: 90,
      imageStoragePath: item.imageStoragePath,
    }
  }

  return null
}
