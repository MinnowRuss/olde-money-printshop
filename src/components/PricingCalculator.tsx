'use client'

import { useState, useMemo, useEffect } from 'react'
import { MEDIA_TYPES, VOLUME_DISCOUNTS } from '@/lib/constants/products'
import type { MediaType, MediaOption } from '@/lib/constants/products'
import { calculatePrice } from '@/lib/pricing'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PricingCalculatorProps {
  /** Pre-select a media type by slug */
  defaultMediaSlug?: string
  /** Pre-fill dimensions */
  defaultWidth?: number
  defaultHeight?: number
  /** Pre-fill quantity */
  defaultQuantity?: number
  /** Callback when price changes (for use in order wizard) */
  onPriceChange?: (result: ReturnType<typeof calculatePrice>) => void
  /** Callback when selections change */
  onSelectionChange?: (selection: {
    mediaSlug: string
    width: number
    height: number
    quantity: number
    selectedOptionSlugs: string[]
  }) => void
}

export default function PricingCalculator({
  defaultMediaSlug,
  defaultWidth = 8,
  defaultHeight = 10,
  defaultQuantity = 1,
  onPriceChange,
  onSelectionChange,
}: PricingCalculatorProps) {
  const [mediaSlug, setMediaSlug] = useState(
    defaultMediaSlug ?? MEDIA_TYPES[0].slug
  )
  const [width, setWidth] = useState(defaultWidth)
  const [height, setHeight] = useState(defaultHeight)
  const [quantity, setQuantity] = useState(defaultQuantity)
  const [selectedOptionSlugs, setSelectedOptionSlugs] = useState<string[]>([])

  const mediaType: MediaType | undefined = MEDIA_TYPES.find(
    (m) => m.slug === mediaSlug
  )

  const selectedOptions: MediaOption[] = useMemo(
    () =>
      mediaType
        ? selectedOptionSlugs
            .map((slug) => mediaType.options.find((o) => o.slug === slug))
            .filter((o): o is MediaOption => o !== undefined)
        : [],
    [mediaType, selectedOptionSlugs]
  )

  const priceResult = useMemo(() => {
    if (!mediaType) return null
    return calculatePrice({
      width,
      height,
      priceTiers: mediaType.priceTiers,
      selectedOptions,
      quantity,
    })
  }, [mediaType, width, height, selectedOptions, quantity])

  // Notify parent of price changes
  useEffect(() => {
    if (priceResult) onPriceChange?.(priceResult)
  }, [priceResult, onPriceChange])

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.({
      mediaSlug,
      width,
      height,
      quantity,
      selectedOptionSlugs,
    })
  }, [mediaSlug, width, height, quantity, selectedOptionSlugs, onSelectionChange])

  function handleMediaChange(slug: string | null) {
    if (!slug) return
    setMediaSlug(slug)
    setSelectedOptionSlugs([]) // Reset options when media type changes
  }

  function toggleOption(slug: string) {
    setSelectedOptionSlugs((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug]
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Your Print</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Media Type */}
          <div className="space-y-2">
            <Label htmlFor="media-type">Media Type</Label>
            <Select value={mediaSlug} onValueChange={handleMediaChange}>
              <SelectTrigger id="media-type">
                <SelectValue placeholder="Select media type">
                  {mediaType?.name ?? 'Select media type'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {MEDIA_TYPES.map((m) => (
                  <SelectItem key={m.slug} value={m.slug}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {mediaType && (
              <p className="text-sm text-zinc-500">{mediaType.description}</p>
            )}
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width (inches)</Label>
              <Input
                id="width"
                type="number"
                min={1}
                max={48}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (inches)</Label>
              <Input
                id="height"
                type="number"
                min={1}
                max={48}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Options */}
          {mediaType && mediaType.options.length > 0 && (
            <div className="space-y-3">
              <Label>Options</Label>
              <div className="space-y-2">
                {mediaType.options.map((opt) => (
                  <label
                    key={opt.slug}
                    className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 transition-colors hover:bg-zinc-50 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedOptionSlugs.includes(opt.slug)}
                      onCheckedChange={() => toggleOption(opt.slug)}
                    />
                    <span className="flex-1 text-sm font-medium">
                      {opt.name}
                    </span>
                    {opt.extraCost > 0 && (
                      <span className="text-sm text-zinc-500">
                        +${opt.extraCost.toFixed(2)}
                      </span>
                    )}
                    {opt.extraCost === 0 && (
                      <span className="text-xs text-zinc-400">Included</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={999}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Number(e.target.value) || 1))
              }
            />
            {/* Volume discount hint */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {VOLUME_DISCOUNTS.filter((d) => d.discountPct > 0).map((d) => (
                <Badge
                  key={d.minQty}
                  variant={
                    quantity >= d.minQty &&
                    (d.maxQty === null || quantity <= d.maxQty)
                      ? 'default'
                      : 'secondary'
                  }
                  className="text-xs"
                >
                  {d.label}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right: Price Display */}
      <Card>
        <CardHeader>
          <CardTitle>Price Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {priceResult && priceResult.matchedTier ? (
            <div className="space-y-4">
              {/* Matched size */}
              <div className="rounded-lg bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-500">
                  Matched Size
                </p>
                <p className="text-lg font-semibold text-zinc-900">
                  {priceResult.matchedTier.label}
                </p>
              </div>

              {/* Line items */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-600">Base price</span>
                  <span className="font-medium">
                    ${priceResult.basePrice.toFixed(2)}
                  </span>
                </div>

                {priceResult.optionsCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Options</span>
                    <span className="font-medium">
                      +${priceResult.optionsCost.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-t border-zinc-100 pt-2">
                  <span className="text-zinc-600">Unit price</span>
                  <span className="font-semibold">
                    ${priceResult.unitPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-600">
                    Subtotal ({quantity} x ${priceResult.unitPrice.toFixed(2)})
                  </span>
                  <span className="font-medium">
                    ${priceResult.subtotal.toFixed(2)}
                  </span>
                </div>

                {priceResult.discountPct > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1.5">
                      Volume discount
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 text-xs"
                      >
                        -{priceResult.discountPct}%
                      </Badge>
                    </span>
                    <span className="font-medium">
                      -${priceResult.discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between rounded-lg bg-zinc-900 p-4 text-white">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold">
                  ${priceResult.total.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-zinc-200 p-8 text-center">
              <p className="text-sm text-zinc-500">
                {width > 0 && height > 0
                  ? 'No pricing available for the selected dimensions. Try a standard size.'
                  : 'Enter dimensions to see pricing.'}
              </p>
              {mediaType && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-zinc-400 mb-2">
                    Available sizes:
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {mediaType.priceTiers.map((t) => (
                      <Badge
                        key={t.label}
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-zinc-100"
                        onClick={() => {
                          setWidth(t.maxWidth)
                          setHeight(t.maxHeight)
                        }}
                      >
                        {t.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
