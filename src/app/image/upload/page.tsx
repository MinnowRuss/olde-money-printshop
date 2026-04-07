'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import { Upload, CheckCircle2, XCircle, FileImage, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type FileStatus = 'pending' | 'uploading' | 'success' | 'error'

interface UploadFile {
  id: string
  file: File
  preview: string | null
  status: FileStatus
  progress: number
  error: string | null
}

function isTiff(file: File) {
  const name = file.name.toLowerCase()
  return name.endsWith('.tif') || name.endsWith('.tiff')
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [hasUploaded, setHasUploaded] = useState(false)

  // Track all created object URLs so we can revoke them on unmount
  const objectUrlsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const objectUrls = objectUrlsRef.current

    return () => {
      // Revoke all remaining object URLs when the component unmounts
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
      objectUrls.clear()
    }
  }, [])

  const uploadFile = useCallback((uploadFile: UploadFile) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append('file', uploadFile.file)

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100)
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, progress } : f
          )
        )
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: 'success', progress: 100 }
              : f
          )
        )
        setHasUploaded(true)
      } else {
        let errorMsg = 'Upload failed'
        try {
          const body = JSON.parse(xhr.responseText)
          if (body.error) errorMsg = body.error
        } catch {
          // use default error message
        }
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: 'error', error: errorMsg }
              : f
          )
        )
      }
    })

    xhr.addEventListener('error', () => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: 'error', error: 'Network error' }
            : f
        )
      )
    })

    xhr.open('POST', '/api/upload')
    xhr.send(formData)

    setFiles((prev) =>
      prev.map((f) =>
        f.id === uploadFile.id ? { ...f, status: 'uploading' } : f
      )
    )
  }, [])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: UploadFile[] = acceptedFiles.map((file) => {
        const preview = isTiff(file) ? null : URL.createObjectURL(file)
        if (preview) objectUrlsRef.current.add(preview)
        return {
          id: crypto.randomUUID(),
          file,
          preview,
          status: 'pending' as FileStatus,
          progress: 0,
          error: null,
        }
      })

      setFiles((prev) => [...prev, ...newFiles])

      // Start uploading each file
      newFiles.forEach((f) => uploadFile(f))
    },
    [uploadFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/tiff': ['.tif', '.tiff'],
    },
    multiple: true,
  })

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Upload Images
        </h1>
        {hasUploaded && (
          <Link
            href="/image"
            className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
          >
            View My Images
          </Link>
        )}
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-zinc-300 hover:border-zinc-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mb-4 h-10 w-10 text-[color:var(--text-tertiary)]" />
        <p className="text-sm font-medium text-foreground">
          {isDragActive
            ? 'Drop your images here...'
            : 'Drag & drop images, or click to browse'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPEG and TIFF only &middot; 50 MB max per file
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              {/* Preview */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-zinc-100">
                {f.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={f.preview}
                    alt={f.file.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FileImage className="h-6 w-6 text-[color:var(--text-tertiary)]" />
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {f.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(f.file.size / (1024 * 1024)).toFixed(1)} MB
                </p>

                {/* Progress bar */}
                {f.status === 'uploading' && (
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                )}

                {/* Error */}
                {f.status === 'error' && f.error && (
                  <p className="mt-1 text-xs text-red-600">{f.error}</p>
                )}
              </div>

              {/* Status icon */}
              <div className="shrink-0">
                {f.status === 'uploading' && (
                  <Loader2 className="h-5 w-5 animate-spin text-[color:var(--text-tertiary)]" />
                )}
                {f.status === 'success' && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                {f.status === 'error' && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload more prompt */}
      {files.length > 0 && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={() => {
              const input = document.querySelector(
                'input[type="file"]'
              ) as HTMLInputElement | null
              input?.click()
            }}
          >
            Upload More
          </Button>
        </div>
      )}
    </div>
  )
}
