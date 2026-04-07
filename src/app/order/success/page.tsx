'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, Loader2, ImageIcon, ClipboardList } from 'lucide-react'

function OrderSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      router.replace('/order')
      return
    }

    const verifySession = async () => {
      try {
        const res = await fetch(`/api/orders/verify?session_id=${sessionId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.paid) {
            setVerified(true)
          } else {
            router.replace('/order')
          }
        } else {
          router.replace('/order')
        }
      } catch {
        router.replace('/order')
      } finally {
        setLoading(false)
      }
    }

    verifySession()

    // Dispatch cart-updated to clear the badge
    window.dispatchEvent(new Event('cart-updated'))
  }, [sessionId, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[color:var(--text-tertiary)]" />
          <p className="text-sm text-muted-foreground">Confirming your order...</p>
        </div>
      </div>
    )
  }

  if (!verified) {
    return null
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <Card className="p-8 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-foreground">
          Order Confirmed!
        </h1>

        <p className="mt-3 text-muted-foreground">
          Thank you for your order. You&apos;ll receive a confirmation email
          shortly with your order details.
        </p>

        <div className="mt-8 space-y-3">
          <Link href="/order/history" className="block">
            <Button className="w-full">
              <ClipboardList className="mr-2 h-4 w-4" />
              View Order History
            </Button>
          </Link>
          <Link href="/image" className="block">
            <Button variant="outline" className="w-full">
              <ImageIcon className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[color:var(--text-tertiary)]" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  )
}
