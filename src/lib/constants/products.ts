// ============================================================
// Product catalog — mirrors Supabase seed data for client-side use
// ============================================================

export interface MediaType {
  slug: string
  name: string
  description: string
  options: MediaOption[]
  priceTiers: PriceTier[]
}

export interface MediaOption {
  slug: string
  name: string
  extraCost: number
}

export interface PriceTier {
  minWidth: number
  maxWidth: number
  minHeight: number
  maxHeight: number
  basePrice: number
  label: string // e.g. "8×10"
}

export interface VolumeDiscount {
  minQty: number
  maxQty: number | null
  discountPct: number
  label: string
}

// Volume discount tiers (applies to all media types)
export const VOLUME_DISCOUNTS: VolumeDiscount[] = [
  { minQty: 1, maxQty: 4, discountPct: 0, label: '1–4 prints' },
  { minQty: 5, maxQty: 9, discountPct: 5, label: '5–9 prints (5% off)' },
  { minQty: 10, maxQty: 24, discountPct: 10, label: '10–24 prints (10% off)' },
  { minQty: 25, maxQty: null, discountPct: 15, label: '25+ prints (15% off)' },
]

export const MEDIA_TYPES: MediaType[] = [
  {
    slug: 'standard-print',
    name: 'Standard Print',
    description: 'Lustre or gloss finish print on photo paper',
    options: [
      { slug: 'lustre-finish', name: 'Lustre Finish', extraCost: 0 },
      { slug: 'gloss-finish', name: 'Gloss Finish', extraCost: 0 },
      { slug: 'matte-finish', name: 'Matte Finish', extraCost: 2.0 },
    ],
    priceTiers: [
      { minWidth: 4, maxWidth: 6, minHeight: 4, maxHeight: 8, basePrice: 8.99, label: '4×6 – 6×8' },
      { minWidth: 7, maxWidth: 8, minHeight: 5, maxHeight: 10, basePrice: 14.99, label: '8×10' },
      { minWidth: 9, maxWidth: 11, minHeight: 7, maxHeight: 14, basePrice: 24.99, label: '11×14' },
      { minWidth: 12, maxWidth: 16, minHeight: 12, maxHeight: 20, basePrice: 39.99, label: '16×20' },
      { minWidth: 17, maxWidth: 20, minHeight: 16, maxHeight: 24, basePrice: 54.99, label: '20×24' },
      { minWidth: 21, maxWidth: 24, minHeight: 18, maxHeight: 36, basePrice: 74.99, label: '24×36' },
    ],
  },
  {
    slug: 'fine-art-paper',
    name: 'Fine Art Paper Print',
    description: 'Archival cotton rag paper with museum-quality reproduction',
    options: [
      { slug: 'hot-press', name: 'Hot Press (Smooth)', extraCost: 0 },
      { slug: 'cold-press', name: 'Cold Press (Textured)', extraCost: 3.0 },
      { slug: 'framed', name: 'Framed', extraCost: 45.0 },
      { slug: 'unframed', name: 'Unframed', extraCost: 0 },
    ],
    priceTiers: [
      { minWidth: 8, maxWidth: 8, minHeight: 8, maxHeight: 10, basePrice: 39.99, label: '8×10' },
      { minWidth: 9, maxWidth: 11, minHeight: 11, maxHeight: 14, basePrice: 59.99, label: '11×14' },
      { minWidth: 12, maxWidth: 16, minHeight: 12, maxHeight: 20, basePrice: 89.99, label: '16×20' },
      { minWidth: 17, maxWidth: 20, minHeight: 16, maxHeight: 24, basePrice: 119.99, label: '20×24' },
      { minWidth: 21, maxWidth: 24, minHeight: 18, maxHeight: 36, basePrice: 159.99, label: '24×36' },
      { minWidth: 25, maxWidth: 36, minHeight: 24, maxHeight: 48, basePrice: 219.99, label: '36×48' },
    ],
  },
]
