import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

/**
 * PATCH /api/admin/orders/[id]/flag
 *
 * Flags an order with a print_notes reason. Order stays in 'processing'.
 * Optionally sends a notification email to the customer.
 *
 * Spec Ref: §3.3 / §4.1 / §6
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  let body: { printNotes: string; notifyCustomer?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.printNotes?.trim()) {
    return NextResponse.json({ message: 'printNotes is required' }, { status: 400 })
  }

  const serviceClient = createServiceClient()
  if (!serviceClient) {
    return NextResponse.json({ message: 'Service unavailable' }, { status: 503 })
  }

  const { data: updated, error: updateError } = await serviceClient
    .from('orders')
    .update({
      print_notes: body.printNotes.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select('id, user_id, status, print_notes')
    .single()

  if (updateError || !updated) {
    console.error('Failed to flag order:', updateError)
    return NextResponse.json({ message: 'Failed to flag order' }, { status: 500 })
  }

  // Optionally notify customer
  if (body.notifyCustomer && resend) {
    try {
      const { data: customerAuth } = await serviceClient.auth.admin.getUserById(
        updated.user_id
      )
      const customerEmail = customerAuth?.user?.email

      if (customerEmail) {
        const orderNum = orderId.slice(0, 8).toUpperCase()
        await resend.emails.send({
          from: 'Olde Money Printshop <orders@oldemoneyprint.shop>',
          to: customerEmail,
          subject: `Order #${orderNum} needs your attention`,
          html: `
            <h1>Your order needs attention</h1>
            <p>We noticed an issue with your order <strong>#${orderNum}</strong>:</p>
            <blockquote style="border-left: 3px solid #ddd; padding-left: 12px; color: #555;">
              ${body.printNotes.trim()}
            </blockquote>
            <p>Please re-upload a corrected image at your earliest convenience, or reply to this email for assistance.</p>
            <p>— Olde Money Printshop</p>
          `,
        })
      }
    } catch (err) {
      console.error('Failed to send flag notification email:', err)
    }
  }

  return NextResponse.json({ message: 'Order flagged', order: updated })
}

/**
 * DELETE /api/admin/orders/[id]/flag
 *
 * Clears the flag (print_notes) from an order.
 *
 * Spec Ref: §3.3 / §6
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const serviceClient = createServiceClient()
  if (!serviceClient) {
    return NextResponse.json({ message: 'Service unavailable' }, { status: 503 })
  }

  const { data: updated, error: updateError } = await serviceClient
    .from('orders')
    .update({
      print_notes: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single()

  if (updateError || !updated) {
    console.error('Failed to clear flag:', updateError)
    return NextResponse.json({ message: 'Failed to clear flag' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Flag cleared', order: updated })
}
