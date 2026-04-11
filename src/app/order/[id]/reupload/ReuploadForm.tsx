'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Loader2,
  Upload,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
} from 'lucide-react'

interface ReuploadItem {
  id: string
  filename: string
  thumbnailUrl: string | null
  mediaTypeName: string | null
  printSize: string | null
  printWidth: number
  printHeight: number
  quantity: number
}

interface ReuploadFormProps {
  orderId: string
  items: ReuploadItem[]
}

export default function ReuploadForm({ orderId, items }: ReuploadFormProps) {
  const router = useRouter()
  const [selectedItemId, setSelectedItemId] = useState<string>(
    items.length === 1 ? items[0].id : ''
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setError('')
    if (!file) {
      setSelectedFile(null)
      return
    }

    // Client-side size check (server re-validates)
    const MAX = 50 * 1024 * 1024
    if (file.size > MAX) {
      setError('File is too large. Maximum size is 50 MB.')
      setSelectedFile(null)
      return
    }

    // Client-side MIME check (server re-validates via magic bytes)
    const ok = ['image/jpeg', 'image/jpg', 'image/tiff', 'image/tif'].includes(
      file.type.toLowerCase()
    )
    if (!ok) {
      setError('Only JPEG and TIFF files are accepted.')
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  const handleSubmit = async () => {
    if (!selectedItemId) {
      setError('Please choose which image to replace.')
      return
    }
    if (!selectedFile) {
      setError('Please choose a replacement file.')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('orderItemId', selectedItemId)

      const res = await fetch(`/api/order/${orderId}/reupload`, {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        setSuccess(true)
        // Small delay so the user sees the success state, then redirect
        setTimeout(() => router.push('/order/history'), 2000)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.message ?? 'Upload failed. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        </div>
        <h2 className="text-lg font-semibold text-emerald-800">Re-upload received</h2>
        <p className="mt-1 text-sm text-emerald-700">
          Thank you! Your replacement image has been queued for re-review. We&rsquo;ll
          email you when it&rsquo;s approved.
        </p>
        <p className="mt-3 text-xs text-emerald-600">Redirecting&hellip;</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Pick the item */}
      <Card className="p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground">
            1. Choose which image to replace
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {items.length === 1
              ? 'This order has one print — we&rsquo;ve selected it for you.'
              : 'Select the print that needs a new image.'}
          </p>
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const isSelected = selectedItemId === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItemId(item.id)}
                disabled={uploading}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                    : 'border-border bg-card hover:border-foreground/20 hover:bg-muted/30'
                }`}
              >
                {/* Thumbnail */}
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100">
                  {item.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnailUrl}
                      alt={item.filename}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-[color:var(--text-tertiary)]" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.filename}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.mediaTypeName ?? 'Print'} &middot;{' '}
                    {item.printSize ?? `${item.printWidth}×${item.printHeight}"`}
                    {item.quantity > 1 && ` · Qty ${item.quantity}`}
                  </p>
                </div>

                {isSelected && (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                )}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Step 2: Upload file */}
      <Card className="p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground">
            2. Choose your replacement file
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            JPEG or TIFF in sRGB colorspace. Maximum 50 MB. For best results,
            aim for at least 200 DPI at the print size.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/tiff,image/tif"
          onChange={handleFileChange}
          disabled={uploading || !selectedItemId}
          className="hidden"
          id="reupload-file"
        />

        {selectedFile ? (
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              disabled={uploading}
            >
              Change
            </Button>
          </div>
        ) : (
          <Label
            htmlFor="reupload-file"
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition-colors ${
              selectedItemId
                ? 'cursor-pointer border-border hover:border-foreground/30 hover:bg-muted/30'
                : 'cursor-not-allowed border-border/50 opacity-60'
            }`}
          >
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Click to choose a file
            </span>
            <span className="text-xs text-muted-foreground">
              JPEG or TIFF, up to 50 MB
            </span>
          </Label>
        )}
      </Card>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit */}
      <div className="sticky bottom-4 z-10">
        <Button
          onClick={handleSubmit}
          disabled={uploading || !selectedFile || !selectedItemId}
          size="lg"
          className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading&hellip;
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Submit replacement
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
