'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { MEDIA_TYPES } from '@/lib/constants/products'
import type { PriceResult } from '@/lib/pricing'
import PricingCalculator from '@/components/PricingCalculator'
import OrderWizardProgress from '@/components/OrderWizardProgress'
import { Button } from '@/components/ui/button'
import type { ImageRecord } from '@/lib/types/image'
import { ChevronLeft, Loader2 } from 'lucide-react'

interface CropData {
  x: number
  y: number
  width: number
  height: number
  unit: string
  aspect?: number
}

// Standard print DPI for converting pixels to inches
const PRINT_DPI = 300

export default function FinishPage() {
  const router = useRouter()
  const params = useParams()
  const imageId = params.imageId as string

  const [loading, setLoading] = useState(true)
  const [imageRecord, setImageRecord] = useState<ImageRecord | null>(null)
  const [cropData, setCropData] = useState<CropData | null>(null)
  const [priceResult, setPriceResult] = useState<PriceResult | null>(null)
  const [currentSelection, setCurrentSelection] = useState<{
    mediaSlug: string
    width: number
    height: number
    quantity: number
    selectedOptionSlugs: string[]
  } | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Fetch image record
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('id', imageId)
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        router.push('/image')
        return
      }

      setImageRecord(data as ImageRecord)

      // Load crop data from sessionStorage — guard against skipping crop step
      const storedCropData = sessionStorage.getItem(`crop_${imageId}`)
      if (!storedCropData) {
        router.push(`/order-image/${imageId}/crop`)
        return
      }
      setCropData(JSON.parse(storedCropData))

      setLoading(false)
    }

    init()
  }, [imageId, supabase, router])

  // Derive print dimensions from crop data and image dimensions
  const getDerivedDimensions = useCallback((): { width: number; height: number } => {
    if (!cropData || !imageRecord) return { width: 8, height: 10 }

    let cropWidthPx: number
    let cropHeightPx: number

    if (cropData.unit === '%') {
      cropWidthPx = (cropData.width / 100) * imageRecord.width
      cropHeightPx = (cropData.height / 100) * imageRecord.height
    } else {
      cropWidthPx = cropData.width
      cropHeightPx = cropData.height
    }

    // Convert pixels to inches at standard DPI
    const widthInches = Math.round(cropWidthPx / PRINT_DPI)
    const heightInches = Math.round(cropHeightPx / PRINT_DPI)

    // Clamp to reasonable print sizes (minimum 4, maximum 48)
    return {
      width: Math.max(4, Math.min(48, widthInches || 8)),
      height: Math.max(4, Math.min(48, heightInches || 10)),
    }
  }, [cropData, imageRecord])

  const handlePriceChange = useCallback((result: PriceResult) => {
    setPriceResult(result)
  }, [])

  const handleSelectionChange = useCallback((selection: {
    mediaSlug: string
    width: number
    height: number
    quantity: number
    selectedOptionSlugs: string[]
  }) => {
    setCurrentSelection(selection)
  }, [])

  const handleNext = () => {
    if (!currentSelection || !priceResult) return

    const mediaType = MEDIA_TYPES.find((m) => m.slug === currentSelection.mediaSlug)

    // Build the option names for display on the review page
    const optionNames = currentSelection.selectedOptionSlugs
      .map((slug) => mediaType?.options.find((o) => o.slug === slug)?.name)
      .filter(Boolean) as string[]

    const finishData = {
      mediaType: mediaType?.name ?? currentSelection.mediaSlug,
      mediaSlug: currentSelection.mediaSlug,
      printSize: priceResult.matchedTier?.label ?? `${currentSelection.width}x${currentSelection.height}`,
      width: currentSelection.width,
      height: currentSelection.height,
      quantity: currentSelection.quantity,
      options: optionNames,
      optionSlugs: currentSelection.selectedOptionSlugs,
      unitPrice: priceResult.unitPrice,
      volumeDiscount: priceResult.discountAmount,
      total: priceResult.total,
    }

    sessionStorage.setItem(`finish_${imageId}`, JSON.stringify(finishData))
    router.push(`/order-image/${imageId}/review`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </div>
    )
  }

  const derivedDimensions = getDerivedDimensions()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <OrderWizardProgress currentStep={3} />

      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/order-image/${imageId}/crop`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Crop
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900">
          Step 3: Options & Price
        </h1>
        <p className="mt-2 text-zinc-600">
          Choose your media type, options, and quantity
        </p>
      </div>

      {/* Pricing Calculator (pre-seeded with derived dimensions) */}
      <PricingCalculator
        defaultWidth={derivedDimensions.width}
        defaultHeight={derivedDimensions.height}
        defaultQuantity={1}
        onPriceChange={handlePriceChange}
        onSelectionChange={handleSelectionChange}
      />

      {/* Navigation buttons */}
      <div className="mt-8 flex justify-end gap-3">
        <Link href={`/order-image/${imageId}/crop`} passHref legacyBehavior>
          <Button variant="outline">Back</Button>
        </Link>
        <Button
          onClick={handleNext}
          disabled={!priceResult?.matchedTier}
        >
          Next: Review
        </Button>
      </div>
    </div>
  )
}
