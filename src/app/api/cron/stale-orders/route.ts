import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const ADMIN_EMAIL = 'admin@oldemoneyprint.shop'

/**
 * GET /api/cron/stale-orders
 *
 * Vercel Cron handler — sends a weekly digest email to admin
 * for orders with unresolved print_notes older than 7 days.
 * Spec Ref: §3.3
 */
export async function GET(request: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const serviceClient = createServiceClient()
  if (!serviceClient) {
    return NextResponse.json({ message: 'Service unavailable' }, { status: 503 })
  }

  // Find orders with print_notes that haven't been resolved in 7+ days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: staleOrders, error } = await serviceClient
    .from('orders')
    .select('id, status, print_notes, updated_at, profiles!inner(full_name)')
    .not('print_notes', 'is', null)
    .not('status', 'in', '("shipped","delivered","cancelled")')
    .lt('updated_at', sevenDaysAgo)
    .order('updated_at', { ascending: true })
    .limit(50)

  if (error) {
    console.error('Stale orders query failed:', error)
    return NextResponse.json({ message: 'Query failed' }, { status: 500 })
  }

  if (!staleOrders || staleOrders.length === 0) {
    return NextResponse.json({ message: 'No stale orders', count: 0 })
  }

  // Build digest email
  if (!resend) {
    console.warn('RESEND_API_KEY not configured — skipping stale orders email')
    return NextResponse.json({ message: 'Email not configured', count: staleOrders.length })
  }

  const rows = staleOrders.map((order: any) => {
    const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles
    const orderNum = order.id.slice(0, 8).toUpperCase()
    const daysStale = Math.floor(
      (Date.now() - new Date(order.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    return `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e4e4e7">#${orderNum}</td>
        <td style="padding:8px;border-bottom:1px solid #e4e4e7">${profile?.full_name || 'Unknown'}</td>
        <td style="padding:8px;border-bottom:1px solid #e4e4e7">${order.status}</td>
        <td style="padding:8px;border-bottom:1px solid #e4e4e7">${daysStale}d</td>
        <td style="padding:8px;border-bottom:1px solid #e4e4e7">${order.print_notes}</td>
      </tr>
    `
  })

  const html = `
    <h1>Stale Orders Digest</h1>
    <p>${staleOrders.length} order(s) have unresolved print notes older than 7 days.</p>
    <table style="border-collapse:collapse;width:100%;font-size:14px">
      <thead>
        <tr style="background:#f4f4f5">
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e4e4e7">Order</th>
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e4e4e7">Customer</th>
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e4e4e7">Status</th>
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e4e4e7">Stale</th>
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e4e4e7">Notes</th>
        </tr>
      </thead>
      <tbody>${rows.join('')}</tbody>
    </table>
    <p style="margin-top:16px">
      <a href="${process.env.NEXT_PUBLIC_URL}/admin/orders">View in Admin Dashboard</a>
    </p>
    <p>— Olde Money Printshop</p>
  `

  try {
    await resend.emails.send({
      from: 'Olde Money Printshop <orders@oldemoneyprint.shop>',
      to: ADMIN_EMAIL,
      subject: `[Action Required] ${staleOrders.length} stale order(s) with unresolved notes`,
      html,
    })
  } catch (emailErr) {
    console.error('Failed to send stale orders digest:', emailErr)
    return NextResponse.json({ message: 'Email send failed', count: staleOrders.length }, { status: 500 })
  }

  return NextResponse.json({ message: 'Digest sent', count: staleOrders.length })
}
