import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/service'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

/**
 * PATCH /api/admin/print-batches/[id]/status
 *
 * Updates batch status. Used by the local print agent to report
 * progress (printing, completed, failed) and store IPP job IDs.
 *
 * Authenticated via PRINT_AGENT_SECRET bearer token (shared secret
 * between the print agent and this API). Not admin-cookie auth
 * because the agent runs as a headless process.
 *
 * Spec Ref: §6 — Print Agent Status Updates
 */

const VALID_TRANSITIONS: Record<string, string[]> = {
  submitted: ['printing', 'failed'],
  printing:  ['completed', 'failed'],
  failed:    ['submitted'],  // retry
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: batchId } = await params

  // Verify print agent auth via bearer token
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  const agentSecret = process.env.PRINT_AGENT_SECRET

  if (!agentSecret || token !== agentSecret) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  // Parse body
  let body: {
    status: string
    ippJobId?: string
    errorMessage?: string
    pdfStoragePath?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  const { status: newStatus, ippJobId, errorMessage, pdfStoragePath } = body

  if (!newStatus) {
    return NextResponse.json({ message: 'status is required' }, { status: 400 })
  }

  const serviceClient = createServiceClient()
  if (!serviceClient) {
    return NextResponse.json({ message: 'Service unavailable' }, { status: 503 })
  }

  // Fetch current batch to validate transition
  const { data: batch, error: fetchError } = await serviceClient
    .from('print_batches')
    .select('id, status')
    .eq('id', batchId)
    .single()

  if (fetchError || !batch) {
    return NextResponse.json({ message: 'Batch not found' }, { status: 404 })
  }

  const allowed = VALID_TRANSITIONS[batch.status]
  if (!allowed || !allowed.includes(newStatus)) {
    return NextResponse.json(
      {
        message: `Invalid transition: ${batch.status} → ${newStatus}. Allowed: ${
          allowed?.join(', ') ?? 'none'
        }`,
      },
      { status: 409 }
    )
  }

  // Build update payload
  const updatePayload: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  }

  if (ippJobId) updatePayload.ipp_job_id = ippJobId
  if (errorMessage) updatePayload.error_message = errorMessage
  if (pdfStoragePath) updatePayload.pdf_storage_path = pdfStoragePath
  if (newStatus === 'completed') updatePayload.completed_at = new Date().toISOString()
  // Clear error on retry/success
  if (newStatus === 'printing' || newStatus === 'completed') {
    updatePayload.error_message = null
  }

  const { data: updated, error: updateError } = await serviceClient
    .from('print_batches')
    .update(updatePayload)
    .eq('id', batchId)
    .select()
    .single()

  if (updateError || !updated) {
    console.error('Failed to update batch status:', updateError)
    return NextResponse.json({ message: 'Failed to update batch' }, { status: 500 })
  }

  // Notify admin on failure
  if (newStatus === 'failed' && resend) {
    resend.emails
      .send({
        from: 'Olde Money Printing <noreply@printing.oldemoney.com>',
        to: ['russ@oldemoney.com'],
        subject: `Print Batch #${batchId.slice(0, 8)} Failed`,
        html: `
          <h2>Print Batch Failed</h2>
          <p><strong>Batch:</strong> ${batchId}</p>
          <p><strong>Error:</strong> ${errorMessage ?? 'Unknown error'}</p>
          <p><strong>Media:</strong> ${updated.media_type_slug ?? 'N/A'}</p>
          <p><strong>Orders:</strong> ${updated.order_ids?.length ?? 0} order(s)</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://printing.oldemoney.com'}/admin/print-queue">
              View Print Queue →
            </a>
          </p>
        `,
      })
      .catch((err: unknown) => console.error('Failed to send batch failure email:', err))
  }

  // If completed, advance linked orders to 'printed'
  if (newStatus === 'completed' && updated.order_ids?.length) {
    const { error: ordersError } = await serviceClient
      .from('orders')
      .update({
        status: 'printed',
        updated_at: new Date().toISOString(),
      })
      .in('id', updated.order_ids)

    if (ordersError) {
      console.error('Failed to advance orders to printed:', ordersError)
    }
  }

  return NextResponse.json({
    batchId: updated.id,
    status: updated.status,
    message: `Batch status updated to ${newStatus}`,
  })
}
