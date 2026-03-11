'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CheckoutPage() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const createSession = async () => {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.message || 'Failed to create checkout session')
        }

        const { url } = await res.json()
        if (url) {
          window.location.href = url
        } else {
          throw new Error('No checkout URL received')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    }

    createSession()
  }, [])

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">
              Checkout Error
            </h1>
            <p className="mt-2 text-sm text-zinc-600">{error}</p>
          </div>
          <Link href="/order">
            <Button variant="outline">Back to Cart</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-400" />
        <div>
          <p className="text-lg font-medium text-zinc-900">
            Redirecting to checkout...
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            You&apos;ll be taken to our secure payment page.
          </p>
        </div>
      </div>
    </div>
  )
}
