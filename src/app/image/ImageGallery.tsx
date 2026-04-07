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
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [deletingBulk, setDeletingBulk] = useState(false)

  // Per-image delete state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deletingSingle, setDeletingSingle] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const deleteTargetImage = deleteTargetId
    ? images.find((img) => img.id === deleteTargetId)
    : null

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
    setDeletingBulk(true)
    setDeleteError(null)
    try {
      const res = await fetch('/api/images/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      })
      if (res.ok) {
        setSelected(new Set())
        setSelectMode(false)
        setShowBulkDeleteDialog(false)
        router.refresh()
      } else {
        const body = await res.json().catch(() => null)
        setDeleteError(body?.error ?? 'Failed to delete selected images. Please try again.')
      }
    } catch {
      setDeleteError('Network error. Please check your connection and try again.')
    } finally {
      setDeletingBulk(false)
    }
  }

  const handleSingleDelete = async () => {
    if (!deleteTargetId) return
    setDeletingSingle(true)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/images/${deleteTargetId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setDeleteTargetId(null)
        router.refresh()
      } else {
        const body = await res.json().catch(() => null)
        setDeleteError(body?.error ?? 'Failed to delete image. Please try again.')
      }
    } catch {
      setDeleteError('Network error. Please check your connection and try again.')
    } finally {
      setDeletingSingle(false)
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
        <div className="text-sm text-muted-foreground">
          {images.length} image{images.length !== 1 ? 's' : ''}
          {selectMode && selected.size > 0 && (
            <span className="ml-2 font-medium text-foreground">
              &middot; {selected.size} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectMode && selected.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkDeleteDialog(true)}
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
            className={`group relative overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md ${
              selected.has(img.id)
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-border'
            }`}
          >
            {/* Checkbox overlay (select mode) */}
            {selectMode && (
              <button
                onClick={() => toggleSelect(img.id)}
                className="absolute left-2 top-2 z-10 rounded-md bg-card/80 p-1 backdrop-blur"
              >
                {selected.has(img.id) ? (
                  <CheckSquare className="h-5 w-5 text-primary" />
                ) : (
                  <Square className="h-5 w-5 text-[color:var(--text-tertiary)]" />
                )}
              </button>
            )}

            {/* Per-image delete button (normal mode) */}
            {!selectMode && (
              <button
                onClick={() => setDeleteTargetId(img.id)}
                className="absolute right-2 top-2 z-10 rounded-md bg-card/80 p-1 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
                title="Delete image"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
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
                <div className="flex h-full items-center justify-center text-[color:var(--text-tertiary)]">
                  No preview
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="truncate text-sm font-medium text-foreground">
                {img.filename}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {img.width} &times; {img.height} &middot;{' '}
                {formatDate(img.created_at)}
              </p>
              {!selectMode && (
                <Link
                  href={`/order-image/${img.id}/crop`}
                  className="mt-2 inline-flex h-7 items-center justify-center rounded-[min(var(--radius-md),12px)] border border-zinc-300 px-2.5 text-[0.8rem] font-medium text-foreground transition-all hover:bg-white/[0.06]"
                >
                  Choose Image
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Per-image delete confirmation dialog */}
      <Dialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTargetId(null)
            setDeleteError(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete
              {deleteTargetImage
                ? ` "${deleteTargetImage.filename}"`
                : ' this image'}
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="text-sm text-red-600">{deleteError}</p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTargetId(null)}
              disabled={deletingSingle}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSingleDelete}
              disabled={deletingSingle}
            >
              {deletingSingle ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk delete confirmation dialog */}
      <Dialog
        open={showBulkDeleteDialog}
        onOpenChange={(open) => {
          setShowBulkDeleteDialog(open)
          if (!open) setDeleteError(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete images</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selected.size} image
              {selected.size !== 1 ? 's' : ''}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="text-sm text-red-600">{deleteError}</p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkDeleteDialog(false)}
              disabled={deletingBulk}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={deletingBulk}
            >
              {deletingBulk ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
