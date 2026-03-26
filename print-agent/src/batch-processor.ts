import { createClient } from '@supabase/supabase-js'
import { writeFile, unlink, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { config } from './config.js'
import { updateBatchStatus } from './api-client.js'
import { printPdf, waitForJobCompletion } from './cups.js'

const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey)

/** Set of batch IDs currently being processed (prevents duplicate processing) */
const processing = new Set<string>()

/**
 * Process a single submitted batch:
 * 1. Download the PDF from Supabase Storage
 * 2. Report status → printing
 * 3. Submit to CUPS via lp
 * 4. Poll CUPS for completion
 * 5. Report status → completed (or failed)
 */
export async function processBatch(batchId: string): Promise<void> {
  if (processing.has(batchId)) {
    console.log(`[batch:${batchId.slice(0, 8)}] Already processing, skipping`)
    return
  }

  processing.add(batchId)
  console.log(`[batch:${batchId.slice(0, 8)}] Starting processing`)

  try {
    // Fetch batch details directly from DB
    const { data: batch, error } = await supabase
      .from('print_batches')
      .select('*')
      .eq('id', batchId)
      .single()

    if (error || !batch) {
      console.error(`[batch:${batchId.slice(0, 8)}] Not found:`, error)
      return
    }

    if (batch.status !== 'submitted') {
      console.log(`[batch:${batchId.slice(0, 8)}] Status is ${batch.status}, not submitted — skipping`)
      return
    }

    // Check for PDF
    if (!batch.pdf_storage_path) {
      await updateBatchStatus(batchId, {
        status: 'failed',
        errorMessage: 'No PDF storage path on batch record. PDF generation may not have run.',
      })
      return
    }

    // Download PDF from Supabase Storage
    const { data: fileData, error: dlError } = await supabase.storage
      .from('print-batches')
      .download(batch.pdf_storage_path)

    if (dlError || !fileData) {
      await updateBatchStatus(batchId, {
        status: 'failed',
        errorMessage: `Failed to download PDF: ${dlError?.message ?? 'unknown error'}`,
      })
      return
    }

    // Write to temp file
    const tempDir = join(tmpdir(), 'olde-money-print-agent')
    await mkdir(tempDir, { recursive: true })
    const tempPath = join(tempDir, `batch-${batchId}.pdf`)
    const buffer = Buffer.from(await fileData.arrayBuffer())
    await writeFile(tempPath, buffer)
    console.log(`[batch:${batchId.slice(0, 8)}] PDF downloaded (${buffer.length} bytes)`)

    // Update status to printing
    await updateBatchStatus(batchId, { status: 'printing' })

    // Submit to CUPS
    let ippJobId: string
    try {
      ippJobId = await printPdf(tempPath)
      console.log(`[batch:${batchId.slice(0, 8)}] CUPS job: ${ippJobId}`)

      // Report IPP job ID
      await updateBatchStatus(batchId, {
        status: 'printing',
        ippJobId,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[batch:${batchId.slice(0, 8)}] CUPS submit failed:`, msg)
      await updateBatchStatus(batchId, {
        status: 'failed',
        errorMessage: `CUPS submission failed: ${msg}`,
      })
      return
    } finally {
      // Clean up temp file
      await unlink(tempPath).catch(() => {})
    }

    // Poll for completion
    const completed = await waitForJobCompletion(ippJobId)

    if (completed) {
      console.log(`[batch:${batchId.slice(0, 8)}] Print completed`)
      await updateBatchStatus(batchId, { status: 'completed' })
    } else {
      console.warn(`[batch:${batchId.slice(0, 8)}] Print timed out`)
      await updateBatchStatus(batchId, {
        status: 'failed',
        errorMessage: 'CUPS job timed out after 10 minutes',
      })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[batch:${batchId.slice(0, 8)}] Unexpected error:`, msg)
    try {
      await updateBatchStatus(batchId, {
        status: 'failed',
        errorMessage: `Agent error: ${msg}`,
      })
    } catch {
      console.error(`[batch:${batchId.slice(0, 8)}] Failed to report error to API`)
    }
  } finally {
    processing.delete(batchId)
  }
}

/**
 * Fallback poll: query for any 'submitted' batches that the Realtime
 * subscription might have missed (network blip, restart, etc).
 */
export async function pollForSubmittedBatches(): Promise<void> {
  const { data: batches, error } = await supabase
    .from('print_batches')
    .select('id')
    .eq('status', 'submitted')
    .order('created_at', { ascending: true })
    .limit(5)

  if (error) {
    console.error('[poll] Failed to query submitted batches:', error.message)
    return
  }

  if (batches && batches.length > 0) {
    console.log(`[poll] Found ${batches.length} submitted batch(es)`)
    for (const batch of batches) {
      processBatch(batch.id).catch((err) =>
        console.error(`[poll] Error processing batch ${batch.id}:`, err)
      )
    }
  }
}
