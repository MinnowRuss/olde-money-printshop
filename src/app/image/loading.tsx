import { Skeleton } from '@/components/ui/skeleton'

export default function ImageLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Progress bar skeleton */}
      <Skeleton className="mb-8 h-2 w-full max-w-md" />

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      {/* Sort controls */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-7 w-14 rounded-lg" />
        <Skeleton className="h-7 w-14 rounded-lg" />
      </div>

      {/* Image grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-zinc-200">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="p-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
