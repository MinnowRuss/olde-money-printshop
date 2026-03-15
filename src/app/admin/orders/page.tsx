import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminOrdersTable from './AdminOrdersTable'

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  if (!supabase) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-zinc-500">Service unavailable.</p>
      </div>
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?returnTo=/admin/orders')
  }

  // Middleware already checks is_admin, but double-check
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/')
  }

  // Fetch all orders with customer info
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      user_id,
      total,
      status,
      tracking_number,
      created_at,
      updated_at,
      order_items (id),
      profiles!inner (full_name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch orders:', error)
  }

  // Get customer emails via auth admin (fallback: user_id)
  // Since we can't access auth.users from client, we'll pass user_ids
  // and let the client-side component handle display
  const formattedOrders = (orders ?? []).map((order: any) => ({
    id: order.id,
    userId: order.user_id,
    customerName: order.profiles?.full_name || 'Unknown',
    total: Number(order.total),
    status: order.status,
    trackingNumber: order.tracking_number,
    itemCount: order.order_items?.length ?? 0,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  }))

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Admin
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
          Orders
        </h1>
        <p className="mt-2 text-zinc-600">
          {formattedOrders.length} total{' '}
          {formattedOrders.length === 1 ? 'order' : 'orders'}
        </p>
      </div>

      <AdminOrdersTable orders={formattedOrders} />
    </div>
  )
}
