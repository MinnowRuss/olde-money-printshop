'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/button'
import OrderWizardProgress from '@/components/OrderWizardProgress'
import type { ImageRecord } from '@/lib/types/image'
import { ChevronLeft, Loader2 } from 'lucide-react'

const ASPECT_RATIOS = [
  { label: '4x5', value: 4 / 5 },
  { label: '5x7', value: 5 / 7 },
  { label: '8x10', value: 8 / 10 },
  { label: '11x14', value: 11 / 14 },
  { label: '16x20', value: 16 / 20 },
  { label: '2x3', value: 2 / 3 },
  { label: '1x1', value: 1 },
]

export default function CropPage() {
  const router = useRouter()
  const params = useParams()
  const imageId = params.imageId as string

  const [loading, setLoading] = useState(true)
  const [imageRecord, setImageRecord] = useState<ImageRecord | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  })
  const [lockedRatio, setLockedRatio] = useState(false)
  const [selectedRatio, setSelectedRatio] = useState<number | undefined>(undefined)
  const [hasCropSelection, setHasCropSelection] = useState(true)

  const supabase = createClient()

  // Auth check and fetch image record
  useEffect(() => {
    const checkAuth = async () => {
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

      // Get signed URL for full-res image
      const { data: signedUrlData } = await supabase.storage
        .from('images')
        .createSignedUrl(data.storage_path, 3600)

      if (signedUrlData?.signedUrl) {
        setImageUrl(signedUrlData.signedUrl)
      }

      setLoading(false)
    }

    checkAuth()
  }, [imageId, supabase, router])

  const handleCropChange = (newCrop: Crop) => {
    setCrop(newCrop)
    setHasCropSelection(newCrop.width !== undefined && newCrop.width > 0)
  }

  const handleRatioChange = (ratio: number) => {
    setSelectedRatio(ratio)
  }

  const handleNext = () => {
    if (!imageId) return

    const cropData = {
      x: crop.x || 0,
      y: crop.y || 0,
      width: crop.width || 0,
      height: crop.height || 0,
      unit: crop.unit || '%',
      aspect: selectedRatio,
    }

    sessionStorage.setItem(`crop_${imageId}`, JSON.stringify(cropData))
    router.push(`/order-image/${imageId}/finish`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[color:var(--text-tertiary)]" />
          <p className="text-sm text-muted-foreground">Loading image...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <OrderWizardProgress currentStep={2} />

      {/* Header */}
      <div className="mb-8">
        <Link
          href="/image"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Gallery
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          Step 2: Crop Your Image
        </h1>
        <p className="mt-2 text-muted-foreground">
          Choose the area of your image to print
        </p>
      </div>

      {/* Main content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Crop tool */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6">
            {imageUrl && (
              <div className="flex justify-center bg-muted/40 p-4 rounded-lg">
                <ReactCrop
                  crop={crop}
                  onChange={handleCropChange}
                  aspect={lockedRatio && selectedRatio ? selectedRatio : undefined}
                  className="max-w-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Image to crop"
                    className="max-w-full h-auto"
                  />
                </ReactCrop>
              </div>
            )}
          </div>
        </div>

        {/* Controls sidebar */}
        <div className="space-y-6">
          {/* Mode toggles */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Crop Mode</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setLockedRatio(false)
                  setSelectedRatio(undefined)
                }}
                className={`w-full rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  !lockedRatio
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-foreground hover:border-zinc-300'
                }`}
              >
                Free Crop
              </button>
              <button
                onClick={() => {
                  setLockedRatio(true)
                  if (!selectedRatio) {
                    const defaultRatio = ASPECT_RATIOS[0].value
                    setSelectedRatio(defaultRatio)
                  }
                }}
                className={`w-full rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  lockedRatio
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-foreground hover:border-zinc-300'
                }`}
              >
                Locked Ratio
              </button>
            </div>
          </div>

          {/* Aspect ratio selector */}
          {lockedRatio && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Aspect Ratio
              </h3>
              <select
                value={selectedRatio || ASPECT_RATIOS[0].value}
                onChange={(e) => handleRatioChange(parseFloat(e.target.value))}
                className="w-full rounded-lg border border-zinc-300 bg-card px-3 py-2 text-sm font-medium text-foreground transition-all hover:border-zinc-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {ASPECT_RATIOS.map((ratio) => (
                  <option key={ratio.label} value={ratio.value}>
                    {ratio.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Image info */}
          {imageRecord && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Image Details
              </h3>
              <dl className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <dt>Filename:</dt>
                  <dd className="font-medium text-foreground">
                    {imageRecord.filename}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Dimensions:</dt>
                  <dd className="font-medium text-foreground">
                    {imageRecord.width} &times; {imageRecord.height}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>File size:</dt>
                  <dd className="font-medium text-foreground">
                    {(imageRecord.file_size / 1024 / 1024).toFixed(2)} MB
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleNext}
              disabled={!hasCropSelection}
              className="w-full"
            >
              Next: Options & Price
            </Button>
            <Link href="/image" passHref legacyBehavior>
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
