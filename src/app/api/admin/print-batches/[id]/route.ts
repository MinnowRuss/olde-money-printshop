import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * GET /api/admin/print-batches/[id]
 *
 * Returns batch details including status, manifest, estimated paper
 * length, and PDF URL. Used for frontend polling during async generation.
 *
 * Spec Ref: §6
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: batchId } = await params

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

  const { data: batch, error } = await serviceClient
    .from('print_batches')
    .select('*')
    .eq('id', batchId)
    .single()

  if (error || !batch) {
    return NextResponse.json({ message: 'Batch not found' }, { status: 404 })
  }

  // Generate signed URL for PDF if it exists
  let pdfUrl: string | null = null
  if (batch.pdf_storage_path) {
    const { data: signedData } = await serviceClient.storage
      .from('print-batches')
      .createSignedUrl(batch.pdf_storage_path, 3600)
    pdfUrl = signedData?.signedUrl ?? null
  }

  return NextResponse.json({
    ...batch,
    pdfUrl,
  })
}
