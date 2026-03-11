import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/orders
 *
 * Creates a Stripe Checkout session from the user's cart items.
 * Returns the session URL for redirect.
 */
export async function POST(request: Request) {
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ message: 'Stripe not configured' }, { status: 503 })
  }

  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ message: 'Service unavailable' }, { status: 503 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  // Parse optional gift message from body
  let giftMessage = ''
  try {
    const body = await request.json()
    giftMessage = body.giftMessage ?? ''
  } catch {
    // No body or invalid JSON — that's fine, gift message is optional
  }

  // Fetch cart items
  const { data: cartItems, error: cartError } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', user.id)

  if (cartError || !cartItems || cartItems.length === 0) {
    return NextResponse.json({ message: 'Cart is empty' }, { status: 400 })
  }

  // Build Stripe line items from cart
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cartItems.map(
    (item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.media_type_name} — ${item.print_size}`,
          description: [
            `${item.width}×${item.height}"`,
            ...(item.option_names?.length ? [item.option_names.join(', ')] : []),
          ].join(' · '),
        },
        unit_amount: Math.round(
          (item.total / item.quantity) * 100
        ), // cents, per-unit after discount
      },
      quantity: item.quantity,
    })
  )

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: user.email,
      success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/order`,
      metadata: {
        user_id: user.id,
        gift_message: giftMessage,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe session creation failed:', err)
    return NextResponse.json(
      { message: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
