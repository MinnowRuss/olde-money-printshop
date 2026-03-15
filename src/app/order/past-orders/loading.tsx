import { Skeleton } from '@/components/ui/skeleton'

export default function PastOrdersLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="mt-2 h-5 w-52" />
        </div>
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>

      {/* Items grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-zinc-200">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/2" />
              <Skeleton className="mt-2 h-3 w-2/3" />
              <div className="mt-2 flex items-center justify-between">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-4 w-14" />
              </div>
              <Skeleton className="mt-3 h-8 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
