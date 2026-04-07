'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function OrderError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Failed to load your orders
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error.message || 'We couldn\u2019t load your cart or order details. Please try again.'}
          </p>
        </div>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </div>
  )
}
