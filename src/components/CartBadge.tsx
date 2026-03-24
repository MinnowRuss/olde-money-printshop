'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

export default function CartBadge() {
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/cart')
        if (res.ok) {
          const data = await res.json()
          setCount(data.count ?? 0)
        }
      } catch {
        // Silently fail — badge stays at 0
      }
    }

    fetchCount()

    // Listen for custom cart-update events so the badge refreshes
    // after adding an item without a full page reload
    const handleCartUpdate = () => fetchCount()
    window.addEventListener('cart-updated', handleCartUpdate)

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate)
    }
  }, [])

  return (
    <Link
      href="/order/history"
      className="relative inline-flex items-center p-1 text-zinc-600 hover:text-zinc-900"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-medium text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
