import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events. On checkout.session.completed:
 * 1. Creates an order record
 * 2. Copies cart_items to order_items
 * 3. Clears the user's cart
 * 4. Sends a confirmation email via Resend
 */
export async function POST(request: NextRequest) {
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ message: 'Stripe not configured' }, { status: 503 })
  }

  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ message: 'Missing stripe-signature header' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ message: 'Webhook secret not configured' }, { status: 503 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Only process paid sessions
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true })
    }

    const userId = session.metadata?.user_id
    const giftMessage = session.metadata?.gift_message || ''

    if (!userId) {
      console.error('No user_id in session metadata')
      return NextResponse.json({ message: 'Missing user_id' }, { status: 400 })
    }

    const supabase = createServiceClient()
    if (!supabase) {
      console.error('Supabase service client not configured')
      return NextResponse.json({ message: 'Service unavailable' }, { status: 503 })
    }

    // Idempotency: check if order already exists for this session
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('stripe_session_id', session.id)
      .single()

    if (existingOrder) {
      // Already processed — safe to return success
      return NextResponse.json({ received: true })
    }

    // Fetch user's cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)

    if (cartError || !cartItems || cartItems.length === 0) {
      console.error('No cart items found for user:', userId)
      return NextResponse.json({ received: true })
    }

    // Calculate order total from cart items
    const orderTotal = cartItems.reduce(
      (sum: number, item: { total: number }) => sum + Number(item.total),
      0
    )

    // Create order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total: orderTotal,
        status: 'processing',
        stripe_session_id: session.id,
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Failed to create order:', orderError)
      return NextResponse.json({ message: 'Failed to create order' }, { status: 500 })
    }

    // Create order_items from cart_items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      image_id: item.image_id,
      media_type_slug: item.media_type_slug,
      media_type_name: item.media_type_name,
      width: item.width,
      height: item.height,
      print_size: item.print_size,
      crop_data: item.crop_data,
      option_slugs: item.option_slugs,
      option_names: item.option_names,
      unit_price: item.unit_price,
      quantity: item.quantity,
      discount_pct: item.discount_pct,
      discount_amount: item.discount_amount,
      total: item.total,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Failed to create order items:', itemsError)
      // Roll back: delete the orphaned order record so Stripe retry can re-process
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ message: 'Failed to create order items' }, { status: 500 })
    }

    // Clear user's cart
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      console.error('Failed to clear cart:', deleteError)
    }

    // Send confirmation email via Resend
    if (resend && session.customer_email) {
      try {
        await resend.emails.send({
          from: 'Olde Money Printshop <orders@oldemoneyprint.shop>',
          to: session.customer_email,
          subject: `Order Confirmed — #${order.id.slice(0, 8).toUpperCase()}`,
          html: `
            <h1>Thank you for your order!</h1>
            <p>Your order <strong>#${order.id.slice(0, 8).toUpperCase()}</strong> has been confirmed.</p>
            <p><strong>Total:</strong> $${orderTotal.toFixed(2)}</p>
            <p><strong>Items:</strong> ${cartItems.length} print${cartItems.length === 1 ? '' : 's'}</p>
            ${giftMessage ? `<p><strong>Gift message:</strong> ${giftMessage}</p>` : ''}
            <p>We'll send you updates as your order is processed and shipped.</p>
            <p>— Olde Money Printshop</p>
          `,
        })
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr)
        // Don't fail the webhook — order was still created successfully
      }
    }
  }

  return NextResponse.json({ received: true })
}
