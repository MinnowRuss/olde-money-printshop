import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminOrdersTable from './AdminOrdersTable'
import { Button } from '@/components/ui/button'

const PAGE_SIZE = 50

interface OrderRow {
  id: string
  user_id: string
  total: number
  status: string
  tracking_number: string | null
  created_at: string
  updated_at: string
  order_items: { id: string }[] | null
  profiles: { full_name: string }[] | { full_name: string } | null
}

interface AdminOrdersPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const { page: pageParam } = await searchParams
  const page = Math.max(0, Number(pageParam ?? 0))
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  const supabase = await createClient()
  if (!supabase) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Service unavailable.</p>
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

  // Fetch paginated orders with customer info
  const { data: orders, error, count } = await supabase
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
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Failed to fetch orders:', error)
  }

  const totalOrders = count ?? 0
  const totalPages = Math.ceil(totalOrders / PAGE_SIZE)

  const formattedOrders = ((orders ?? []) as unknown as OrderRow[]).map((order) => {
    const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles
    return {
    id: order.id,
    userId: order.user_id,
    customerName: profile?.full_name || 'Unknown',
    total: Number(order.total),
    status: order.status,
    trackingNumber: order.tracking_number,
    itemCount: order.order_items?.length ?? 0,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  }
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Admin
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          Orders
        </h1>
        <p className="mt-2 text-muted-foreground">
          {totalOrders} total{' '}
          {totalOrders === 1 ? 'order' : 'orders'}
          {totalPages > 1 && ` · Page ${page + 1} of ${totalPages}`}
        </p>
      </div>

      <AdminOrdersTable orders={formattedOrders} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          {page > 0 ? (
            <Link href={`/admin/orders?page=${page - 1}`}>
              <Button variant="outline" size="sm">Previous</Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>Previous</Button>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          {page < totalPages - 1 ? (
            <Link href={`/admin/orders?page=${page + 1}`}>
              <Button variant="outline" size="sm">Next</Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>Next</Button>
          )}
        </div>
      )}
    </div>
  )
}
