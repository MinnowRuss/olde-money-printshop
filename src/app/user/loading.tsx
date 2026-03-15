import { Skeleton } from '@/components/ui/skeleton'

export default function UserProfileLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Skeleton className="mb-8 h-8 w-40" />

      <div className="space-y-6">
        {/* Address form card */}
        <div className="rounded-xl border border-zinc-200 p-6">
          <Skeleton className="mb-4 h-6 w-36" />
          <div className="space-y-4">
            <div>
              <Skeleton className="mb-1 h-4 w-20" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="mb-1 h-4 w-28" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="mb-1 h-4 w-12" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
              <div>
                <Skeleton className="mb-1 h-4 w-12" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>

        {/* Password form card */}
        <div className="rounded-xl border border-zinc-200 p-6">
          <Skeleton className="mb-4 h-6 w-40" />
          <div className="space-y-4">
            <div>
              <Skeleton className="mb-1 h-4 w-28" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="mb-1 h-4 w-32" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <Skeleton className="h-8 w-36 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
