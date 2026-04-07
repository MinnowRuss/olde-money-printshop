'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Loader2,
  ShoppingCart,
  ImageIcon,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
} from 'lucide-react'

interface CartItem {
  id: string
  image_id: string
  media_type_slug: string
  media_type_name: string
  width: number
  height: number
  print_size: string
  crop_data: unknown
  option_slugs: string[]
  option_names: string[]
  quantity: number
  unit_price: number
  discount_pct: number
  discount_amount: number
  total: number
  created_at: string
  images?: {
    id: string
    filename: string
    thumbnail_path: string
  }
}

export default function CartPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({})
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)

  const fetchCart = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select('*, images(id, filename, thumbnail_path)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch cart:', error)
      setLoading(false)
      return
    }

    setCartItems((data as CartItem[]) ?? [])

    // Fetch signed URLs for thumbnails
    const urls: Record<string, string> = {}
    for (const item of data ?? []) {
      const img = (item as CartItem).images
      if (img?.thumbnail_path) {
        const { data: signedUrlData } = await supabase.storage
          .from('images')
          .createSignedUrl(img.thumbnail_path, 3600)
        if (signedUrlData?.signedUrl) {
          urls[item.id] = signedUrlData.signedUrl
        }
      }
    }
    setThumbUrls(urls)
    setLoading(false)
  }, [supabase, router])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      setConfirmRemoveId(itemId)
      return
    }

    setUpdatingId(itemId)
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      })

      if (res.ok) {
        const updated = await res.json()
        setCartItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, ...updated } : item))
        )
        window.dispatchEvent(new Event('cart-updated'))
      }
    } catch (err) {
      console.error('Failed to update quantity:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemove = async (itemId: string) => {
    setRemovingId(itemId)
    setConfirmRemoveId(null)
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: 'DELETE' })
      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== itemId))
        window.dispatchEvent(new Event('cart-updated'))
      }
    } catch (err) {
      console.error('Failed to remove item:', err)
    } finally {
      setRemovingId(null)
    }
  }

  // Calculate order totals from all cart items
  const orderSubtotal = cartItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  )
  const orderDiscount = cartItems.reduce(
    (sum, item) => sum + (item.discount_amount ?? 0),
    0
  )
  const orderTotal = cartItems.reduce((sum, item) => sum + item.total, 0)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[color:var(--text-tertiary)]" />
          <p className="text-sm text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    )
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100">
            <ShoppingCart className="h-10 w-10 text-[color:var(--text-tertiary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Your cart is empty</h1>
            <p className="mt-2 text-muted-foreground">
              Browse your images and create beautiful prints.
            </p>
          </div>
          <Link href="/image">
            <Button>
              <ImageIcon className="mr-2 h-4 w-4" />
              Browse Images
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Your Cart
        </h1>
        <p className="mt-2 text-muted-foreground">
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart items */}
        <div className="space-y-4 lg:col-span-2">
          {cartItems.map((item) => (
            <Card key={item.id} className="p-4 sm:p-6">
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  {thumbUrls[item.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbUrls[item.id]}
                      alt={item.images?.filename ?? 'Print'}
                      className="h-20 w-20 rounded-lg object-cover sm:h-24 sm:w-24"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-zinc-100 sm:h-24 sm:w-24">
                      <ImageIcon className="h-8 w-8 text-primary-foreground/80" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.images?.filename ?? 'Untitled'}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.media_type_name} &middot; {item.print_size} &middot;{' '}
                      {item.width}&times;{item.height}&quot;
                    </p>
                    {item.option_names && item.option_names.length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.option_names.join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Quantity controls + price */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Quantity controls */}
                      <div className="flex items-center rounded-md border border-border">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={updatingId === item.id}
                          className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="flex h-8 w-8 items-center justify-center border-x border-border text-sm font-medium text-foreground">
                          {updatingId === item.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={updatingId === item.id}
                          className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Remove button */}
                      {confirmRemoveId === item.id ? (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Remove?</span>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="font-medium text-red-600 hover:text-red-700"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmRemoveId(null)}
                            className="font-medium text-muted-foreground hover:text-foreground"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmRemoveId(item.id)}
                          disabled={removingId === item.id}
                          className="flex items-center gap-1 text-sm text-[color:var(--text-tertiary)] transition-colors hover:text-red-600 disabled:opacity-50"
                          aria-label="Remove item"
                        >
                          {removingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Line total */}
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        ${item.total.toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted-foreground">
                          ${item.unit_price.toFixed(2)} each
                        </p>
                      )}
                      {item.discount_pct > 0 && (
                        <p className="text-xs font-medium text-green-600">
                          {item.discount_pct}% off
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order summary sidebar */}
        <div>
          <Card className="sticky top-20 p-6">
            <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>

            <dl className="mt-4 space-y-3 border-b border-border pb-4">
              <div className="flex justify-between text-sm">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium text-foreground">
                  ${orderSubtotal.toFixed(2)}
                </dd>
              </div>
              {orderDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">Volume discount</dt>
                  <dd className="font-medium text-green-600">
                    -${orderDiscount.toFixed(2)}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-4 flex justify-between">
              <dt className="text-sm font-semibold text-foreground">Total</dt>
              <dd className="text-lg font-bold text-foreground">
                ${orderTotal.toFixed(2)}
              </dd>
            </div>

            <div className="mt-6 space-y-2">
              <Link href="/order/checkout">
                <Button className="w-full">
                  Continue to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/image">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
