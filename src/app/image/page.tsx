import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ImageUp } from 'lucide-react'
import type { ImageRecord } from '@/lib/types/image'
import OrderWizardProgress from '@/components/OrderWizardProgress'
import ImageGallery from './ImageGallery'

export const metadata = { title: 'My Images — Olde Money Printshop' }

interface Props {
  searchParams: Promise<{ sort?: string }>
}

export default async function ImageLibraryPage({ searchParams }: Props) {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Sort handling
  const { sort } = await searchParams
  const sortBy = sort === 'name' ? 'name' : 'date'

  let query = supabase
    .from('images')
    .select('*')
    .eq('user_id', user.id)

  if (sortBy === 'name') {
    query = query.order('filename', { ascending: true })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: images } = await query

  // Generate signed URLs for thumbnails (1-hour expiry)
  const imagesWithUrls: (ImageRecord & { thumbUrl: string })[] = []

  if (images && images.length > 0) {
    const paths = images.map((img: ImageRecord) => img.thumbnail_path)
    const { data: signedUrls } = await supabase.storage
      .from('images')
      .createSignedUrls(paths, 3600)

    for (let i = 0; i < images.length; i++) {
      imagesWithUrls.push({
        ...images[i],
        thumbUrl: signedUrls?.[i]?.signedUrl ?? '',
      })
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <OrderWizardProgress currentStep={1} />

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Step 1: Choose an Image
        </h1>
        <Link
          href="/image/upload"
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
        >
          <ImageUp className="h-4 w-4" />
          Upload
        </Link>
      </div>

      {/* Sort controls */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Sort by:</span>
        <Link
          href="/image?sort=date"
          className={`inline-flex h-7 items-center justify-center rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] font-medium transition-all ${
            sortBy === 'date'
              ? 'bg-primary text-primary-foreground'
              : 'border border-zinc-300 text-foreground hover:bg-white/[0.06]'
          }`}
        >
          Date
        </Link>
        <Link
          href="/image?sort=name"
          className={`inline-flex h-7 items-center justify-center rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] font-medium transition-all ${
            sortBy === 'name'
              ? 'bg-primary text-primary-foreground'
              : 'border border-zinc-300 text-foreground hover:bg-white/[0.06]'
          }`}
        >
          Name
        </Link>
      </div>

      {/* Gallery or empty state */}
      {imagesWithUrls.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 py-20 text-center">
          <ImageUp className="mb-4 h-10 w-10 text-[color:var(--text-tertiary)]" />
          <p className="text-sm font-medium text-foreground">
            No images yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload your first image to get started.
          </p>
          <Link
            href="/image/upload"
            className="mt-4 inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
          >
            Upload A File
          </Link>
        </div>
      ) : (
        <ImageGallery images={imagesWithUrls} />
      )}
    </div>
  )
}
