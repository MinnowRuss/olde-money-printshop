'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trash2, CheckSquare, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ImageRecord } from '@/lib/types/image'

interface GalleryImage extends ImageRecord {
  thumbUrl: string
}

interface Props {
  images: GalleryImage[]
}

export default function ImageGallery({ images }: Props) {
  const router = useRouter()
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleBulkDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/images/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      })
      if (res.ok) {
        setSelected(new Set())
        setSelectMode(false)
        setShowDeleteDialog(false)
        router.refresh()
      }
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <>
      {/* Selection toolbar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-zinc-500">
          {images.length} image{images.length !== 1 ? 's' : ''}
          {selectMode && selected.size > 0 && (
            <span className="ml-2 font-medium text-zinc-900">
              &middot; {selected.size} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectMode && selected.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Delete
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectMode(!selectMode)
              setSelected(new Set())
            }}
          >
            {selectMode ? 'Cancel' : 'Select'}
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img) => (
          <div
            key={img.id}
            className={`group relative overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md ${
              selected.has(img.id)
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-zinc-200'
            }`}
          >
            {/* Checkbox overlay */}
            {selectMode && (
              <button
                onClick={() => toggleSelect(img.id)}
                className="absolute left-2 top-2 z-10 rounded-md bg-white/80 p-1 backdrop-blur"
              >
                {selected.has(img.id) ? (
                  <CheckSquare className="h-5 w-5 text-primary" />
                ) : (
                  <Square className="h-5 w-5 text-zinc-400" />
                )}
              </button>
            )}

            {/* Thumbnail */}
            <div
              className="aspect-[4/3] w-full cursor-pointer overflow-hidden bg-zinc-100"
              onClick={() => {
                if (selectMode) {
                  toggleSelect(img.id)
                }
              }}
            >
              {img.thumbUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img.thumbUrl}
                  alt={img.filename}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-400">
                  No preview
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="truncate text-sm font-medium text-zinc-900">
                {img.filename}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {img.width} &times; {img.height} &middot;{' '}
                {formatDate(img.created_at)}
              </p>
              {!selectMode && (
                <Link
                  href={`/order-image/${img.id}/crop`}
                  className="mt-2 inline-flex h-7 items-center justify-center rounded-[min(var(--radius-md),12px)] border border-zinc-300 px-2.5 text-[0.8rem] font-medium text-zinc-700 transition-all hover:bg-zinc-100"
                >
                  Choose Image
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete images</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selected.size} image
              {selected.size !== 1 ? 's' : ''}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
