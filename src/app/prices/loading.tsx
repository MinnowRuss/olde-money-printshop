import { Skeleton } from '@/components/ui/skeleton'

export default function PricesLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <Skeleton className="mx-auto h-10 w-40" />
        <Skeleton className="mx-auto mt-3 h-6 w-80" />
      </div>

      {/* Volume discount banner */}
      <Skeleton className="mb-10 h-24 w-full rounded-xl" />

      {/* Media type sections */}
      <div className="space-y-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 p-6">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="mt-2 h-4 w-72" />
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Price table */}
              <div>
                <Skeleton className="mb-3 h-4 w-32" />
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Options */}
              <div>
                <Skeleton className="mb-3 h-4 w-36" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-10 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
