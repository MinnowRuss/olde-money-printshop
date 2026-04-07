import { Skeleton } from '@/components/ui/skeleton'

export default function OrderHistoryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-20" />
      </div>

      {/* Order cards */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border p-4 sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div>
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="mt-1 h-4 w-20" />
                </div>
                <div>
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="mt-1 h-4 w-24" />
                </div>
                <div>
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="mt-1 h-4 w-16" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTAs */}
      <div className="mt-8 flex justify-center gap-4">
        <Skeleton className="h-8 w-44 rounded-lg" />
        <Skeleton className="h-8 w-40 rounded-lg" />
      </div>
    </div>
  )
}
