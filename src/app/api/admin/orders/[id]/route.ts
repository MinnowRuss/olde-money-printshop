import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

interface OrderUpdatePayload {
  updated_at: string
  status?: string
  tracking_number?: string
  print_notes?: string | null
  verified_at?: string
  verified_by?: string
}

/**
 * PATCH /api/admin/orders/[id]
 *
 * Updates order status and/or tracking number.
 * Sends a notification email to the customer when status changes.
 * Admin-only endpoint.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params

  // Verify admin auth
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

  // Check admin status
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  // Parse request body
  let body: {
    status?: string
    tracking_number?: string
    print_notes?: string | null
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  const { status, tracking_number, print_notes } = body

  // Validate status if provided
  const VALID_STATUSES = [
    'pending', 'processing', 'verified', 'queued',
    'printing', 'printed', 'shipped', 'delivered', 'cancelled',
  ] as const
  if (status && !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    return NextResponse.json(
      { message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 }
    )
  }

  // Use service client to bypass RLS for updating another user's order
  const serviceClient = createServiceClient()
  if (!serviceClient) {
    return NextResponse.json({ message: 'Service unavailable' }, { status: 503 })
  }

  // Fetch current order (to get previous status + customer user_id)
  const { data: currentOrder, error: fetchError } = await serviceClient
    .from('orders')
    .select('id, user_id, status, tracking_number, total')
    .eq('id', orderId)
    .single()

  if (fetchError || !currentOrder) {
    return NextResponse.json({ message: 'Order not found' }, { status: 404 })
  }

  // Build update payload
  const updatePayload: OrderUpdatePayload = {
    updated_at: new Date().toISOString(),
  }
  if (status) updatePayload.status = status
  if (tracking_number !== undefined) updatePayload.tracking_number = tracking_number
  if (print_notes !== undefined) updatePayload.print_notes = print_notes

  // Auto-set verification fields when marking as verified
  if (status === 'verified') {
    updatePayload.verified_at = new Date().toISOString()
    updatePayload.verified_by = user.id
  }

  // Update the order
  const { data: updatedOrder, error: updateError } = await serviceClient
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId)
    .select()
    .single()

  if (updateError) {
    console.error('Failed to update order:', updateError)
    return NextResponse.json({ message: 'Failed to update order' }, { status: 500 })
  }

  // Send email notification if status changed
  if (status && status !== currentOrder.status && resend) {
    try {
      // Get customer email from auth (service client can access auth.users)
      const { data: customerAuth } = await serviceClient.auth.admin.getUserById(
        currentOrder.user_id
      )
      const customerEmail = customerAuth?.user?.email

      if (customerEmail) {
        const orderNum = orderId.slice(0, 8).toUpperCase()

        // Build email content based on new status
        let subject = ''
        let bodyHtml = ''

        switch (status) {
          case 'processing':
            subject = `Order #${orderNum} is being processed`
            bodyHtml = `
              <h1>Your order is being processed!</h1>
              <p>We've started working on your order <strong>#${orderNum}</strong>.</p>
              <p>We'll notify you when it ships.</p>
            `
            break
          case 'verified':
            subject = `Order #${orderNum} — verified and queuing for print`
            bodyHtml = `
              <h1>Your order has been verified!</h1>
              <p>Your order <strong>#${orderNum}</strong> has been reviewed and approved for printing.</p>
              <p>We'll notify you once printing is complete.</p>
            `
            break
          case 'printed':
            subject = `Order #${orderNum} — printing complete!`
            bodyHtml = `
              <h1>Your prints are ready!</h1>
              <p>Great news! Your order <strong>#${orderNum}</strong> has been printed and is being prepared for shipment.</p>
              <p>We'll send you tracking information once it ships.</p>
            `
            break
          case 'shipped':
            subject = `Order #${orderNum} has shipped!`
            bodyHtml = `
              <h1>Your order has shipped!</h1>
              <p>Great news! Your order <strong>#${orderNum}</strong> is on its way.</p>
              ${
                tracking_number || currentOrder.tracking_number
                  ? `<p><strong>Tracking Number:</strong> ${tracking_number || currentOrder.tracking_number}</p>`
                  : ''
              }
              <p>You can track your shipment using the tracking number above.</p>
            `
            break
          case 'delivered':
            subject = `Order #${orderNum} has been delivered`
            bodyHtml = `
              <h1>Your order has been delivered!</h1>
              <p>Your order <strong>#${orderNum}</strong> has been delivered.</p>
              <p>We hope you love your prints! If you have any questions, don't hesitate to reach out.</p>
            `
            break
          case 'cancelled':
            subject = `Order #${orderNum} has been cancelled`
            bodyHtml = `
              <h1>Your order has been cancelled</h1>
              <p>Your order <strong>#${orderNum}</strong> has been cancelled.</p>
              <p>If you have any questions about this cancellation, please contact us.</p>
            `
            break
          default:
            subject = `Update on Order #${orderNum}`
            bodyHtml = `
              <h1>Order Update</h1>
              <p>Your order <strong>#${orderNum}</strong> status has been updated to <strong>${status}</strong>.</p>
            `
        }

        bodyHtml += `<p>— Olde Money Printshop</p>`

        await resend.emails.send({
          from: 'Olde Money Printshop <orders@oldemoneyprint.shop>',
          to: customerEmail,
          subject,
          html: bodyHtml,
        })
      }
    } catch (emailErr) {
      console.error('Failed to send status update email:', emailErr)
      // Don't fail the API call — the order was still updated
    }
  }

  return NextResponse.json(updatedOrder)
}
