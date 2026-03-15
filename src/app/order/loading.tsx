import { Skeleton } from '@/components/ui/skeleton'

export default function OrderLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="mt-2 h-5 w-28" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart items */}
        <div className="space-y-4 lg:col-span-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-4 rounded-xl border border-zinc-200 p-4 sm:p-6"
            >
              <Skeleton className="h-20 w-20 flex-shrink-0 rounded-lg sm:h-24 sm:w-24" />
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-2 h-3 w-56" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Skeleton className="h-8 w-24 rounded-md" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary sidebar */}
        <div>
          <div className="rounded-xl border border-zinc-200 p-6">
            <Skeleton className="h-6 w-36" />
            <div className="mt-4 space-y-3 border-b border-zinc-200 pb-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="mt-6 h-8 w-full rounded-lg" />
            <Skeleton className="mt-2 h-8 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
