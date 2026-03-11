import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/orders/verify?session_id=...
 *
 * Verifies that a Stripe Checkout session was paid.
 * Used by the success page to confirm the order.
 */
export async function GET(request: NextRequest) {
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

  const sessionId = request.nextUrl.searchParams.get('session_id')
  if (!sessionId) {
    return NextResponse.json({ message: 'Missing session_id' }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Verify the session belongs to this user (via metadata)
    if (session.metadata?.user_id !== user.id) {
      return NextResponse.json({ paid: false })
    }

    return NextResponse.json({
      paid: session.payment_status === 'paid',
      orderNumber: session.id.slice(-8).toUpperCase(),
    })
  } catch {
    return NextResponse.json({ paid: false })
  }
}
