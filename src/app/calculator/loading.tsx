import { Skeleton } from '@/components/ui/skeleton'

export default function CalculatorLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>

      {/* Calculator form */}
      <div className="rounded-xl border border-border p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: inputs */}
          <div className="space-y-5">
            <div>
              <Skeleton className="mb-1 h-4 w-24" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="mb-1 h-4 w-14" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
              <div>
                <Skeleton className="mb-1 h-4 w-14" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            </div>
            <div>
              <Skeleton className="mb-2 h-4 w-20" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            </div>
            <div>
              <Skeleton className="mb-1 h-4 w-18" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          </div>

          {/* Right: price summary */}
          <div className="rounded-xl border border-border p-5">
            <Skeleton className="h-6 w-32" />
            <div className="mt-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
