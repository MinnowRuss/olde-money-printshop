'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import OrderWizardProgress from '@/components/OrderWizardProgress'
import type { ImageRecord } from '@/lib/types/image'
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react'

interface CropData {
  x: number
  y: number
  width: number
  height: number
  unit: string
  aspect?: number
}

interface FinishData {
  mediaType: string
  mediaSlug: string
  printSize: string
  width: number
  height: number
  quantity: number
  options: string[]
  optionSlugs: string[]
  unitPrice: number
  volumeDiscount: number
  total: number
}

export default function ReviewPage() {
  const router = useRouter()
  const params = useParams()
  const imageId = params.imageId as string

  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [imageRecord, setImageRecord] = useState<ImageRecord | null>(null)
  const [thumbUrl, setThumbUrl] = useState<string | null>(null)
  const [cropData, setCropData] = useState<CropData | null>(null)
  const [finishData, setFinishData] = useState<FinishData | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      // Fetch image record
      const { data, error: imageError } = await supabase
        .from('images')
        .select('*')
        .eq('id', imageId)
        .eq('user_id', user.id)
        .single()

      if (imageError || !data) {
        router.push('/image')
        return
      }

      setImageRecord(data as ImageRecord)

      // Get signed URL for thumbnail
      const { data: signedUrlData } = await supabase.storage
        .from('images')
        .createSignedUrl(data.thumbnail_path, 3600)

      if (signedUrlData?.signedUrl) {
        setThumbUrl(signedUrlData.signedUrl)
      }

      // Load crop and finish data from sessionStorage
      const storedCropData = sessionStorage.getItem(`crop_${imageId}`)
      const storedFinishData = sessionStorage.getItem(`finish_${imageId}`)

      if (storedCropData) {
        setCropData(JSON.parse(storedCropData))
      }

      if (storedFinishData) {
        setFinishData(JSON.parse(storedFinishData))
      }

      setLoading(false)
    }

    checkAuth()
  }, [imageId, supabase, router])

  const handleAddToCart = async () => {
    if (!cropData || !finishData) {
      setError('Missing order data. Please go back and complete all steps.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const orderData = {
        imageId,
        cropData,
        finishData,
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to add to cart')
      }

      // Notify the navbar cart badge to refresh
      window.dispatchEvent(new Event('cart-updated'))

      // Success - navigate to cart
      router.push('/order')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          <p className="text-sm text-zinc-500">Loading order details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <OrderWizardProgress currentStep={4} />

      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/order-image/${imageId}/finish`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900">
          Step 4: Review Order
        </h1>
        <p className="mt-2 text-zinc-600">
          Check your order details before adding to cart
        </p>
      </div>

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-4 right-4 z-50 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 shadow-lg">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Order summary */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Image section */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">
              Image
            </h2>
            <div className="flex gap-4">
              {thumbUrl && (
                <div className="flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbUrl}
                    alt="Order image"
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-900">
                  {imageRecord?.filename}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {imageRecord?.width} &times; {imageRecord?.height}
                </p>
                {cropData && (
                  <p className="mt-2 text-xs text-zinc-600">
                    <span className="font-medium">Crop:</span> {cropData.width.toFixed(1)}
                    {cropData.unit} &times; {cropData.height.toFixed(1)}
                    {cropData.unit}
                    {cropData.aspect && ` (${cropData.aspect.toFixed(2)} ratio)`}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Options section */}
          {finishData && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900">
                Order Options
              </h2>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-zinc-600">Media Type:</dt>
                  <dd className="text-sm font-medium text-zinc-900">
                    {finishData.mediaType}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-zinc-600">Print Size:</dt>
                  <dd className="text-sm font-medium text-zinc-900">
                    {finishData.printSize}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-zinc-600">Quantity:</dt>
                  <dd className="text-sm font-medium text-zinc-900">
                    {finishData.quantity}
                  </dd>
                </div>
                {finishData.options && finishData.options.length > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-zinc-600">Add-ons:</dt>
                    <dd className="text-right text-sm font-medium text-zinc-900">
                      {finishData.options.join(', ')}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          )}
        </div>

        {/* Pricing sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">
              Price
            </h2>
            <dl className="space-y-3 border-b border-zinc-200 pb-4">
              {finishData?.unitPrice !== undefined && (
                <div className="flex justify-between text-sm">
                  <dt className="text-zinc-600">Unit price:</dt>
                  <dd className="font-medium text-zinc-900">
                    ${finishData.unitPrice.toFixed(2)}
                  </dd>
                </div>
              )}
              {finishData?.quantity !== undefined && finishData?.unitPrice !== undefined && (
                <div className="flex justify-between text-sm">
                  <dt className="text-zinc-600">Subtotal:</dt>
                  <dd className="font-medium text-zinc-900">
                    ${(finishData.unitPrice * finishData.quantity).toFixed(2)}
                  </dd>
                </div>
              )}
              {finishData?.volumeDiscount !== undefined &&
                finishData.volumeDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <dt className="text-zinc-600">Volume discount:</dt>
                    <dd className="font-medium text-green-600">
                      -${finishData.volumeDiscount.toFixed(2)}
                    </dd>
                  </div>
                )}
            </dl>

            {finishData?.unitPrice !== undefined &&
              finishData?.quantity !== undefined && (
                <div className="mt-4 flex justify-between">
                  <dt className="text-sm font-semibold text-zinc-900">Total:</dt>
                  <dd className="text-lg font-bold text-zinc-900">
                    $
                    {(
                      finishData.unitPrice * finishData.quantity -
                      (finishData.volumeDiscount || 0)
                    ).toFixed(2)}
                  </dd>
                </div>
              )}
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleAddToCart}
              disabled={submitting || !cropData || !finishData}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding to cart...
                </>
              ) : (
                'Add to Cart'
              )}
            </Button>
            <Link href={`/order-image/${imageId}/finish`} passHref legacyBehavior>
              <Button variant="outline" className="w-full">
                Back to Options
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
