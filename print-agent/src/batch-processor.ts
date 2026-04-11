import { createClient } from '@supabase/supabase-js'
import { writeFile, unlink, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { config } from './config.js'
import { updateBatchStatus } from './api-client.js'
import { printPdf, waitForJobCompletion } from './cups.js'
import { renderBatchPdf, type NestingManifest } from './pdf-renderer.js'

const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey)

/** Set of batch IDs currently being processed (prevents duplicate processing) */
const processing = new Set<string>()

/**
 * Retry an async operation with exponential backoff.
 *
 * Spec §7.3 / F-12: 3 attempts with exponential delays (2s, 4s between
 * retries). Wraps transient-failure points like CUPS submit and PDF
 * generation so a single network blip or printer hiccup doesn't fail
 * the whole batch.
 *
 * Throws the final error if all attempts fail.
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  label: string,
  maxAttempts = 3,
  baseDelayMs = 2000
): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const msg = err instanceof Error ? err.message : String(err)
      if (attempt === maxAttempts) {
        console.error(`[retry] ${label} failed after ${maxAttempts} attempts: ${msg}`)
        throw err
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1)
      console.warn(
        `[retry] ${label} attempt ${attempt}/${maxAttempts} failed: ${msg} — retrying in ${delay}ms`
      )
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  // Unreachable: either fn() returned or the final throw fired above.
  throw lastError
}

/**
 * Process a single submitted batch:
 * 1. Generate PDF from nesting manifest (if not already generated)
 * 2. Download the PDF from Supabase Storage to a temp file
 * 3. Report status → printing
 * 4. Submit to CUPS via lp (canonical command per spec §4.4)
 * 5. Poll CUPS for completion
 * 6. Report status → completed (or failed)
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

    // ── Step 1: Ensure PDF exists ────────────────────────────
    // On Vercel Hobby (10s timeout), PDF generation runs here on
    // the print agent rather than in a Vercel API route.
    // If pdf_storage_path is already set, skip generation and download it.

    let pdfStoragePath = batch.pdf_storage_path as string | null

    if (!pdfStoragePath) {
      const manifest = batch.manifest as NestingManifest | null
      if (!manifest || !manifest.placements?.length) {
        await updateBatchStatus(batchId, {
          status: 'failed',
          errorMessage: 'Batch has no manifest — cannot generate PDF. Re-create the batch.',
        })
        return
      }

      console.log(`[batch:${batchId.slice(0, 8)}] No PDF yet — generating from manifest (${manifest.placements.length} items)`)
      try {
        pdfStoragePath = await retryWithBackoff(
          () => renderBatchPdf(batchId, manifest, batch.roll_width_in),
          `PDF generation for batch ${batchId.slice(0, 8)}`
        )
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`[batch:${batchId.slice(0, 8)}] PDF generation failed:`, msg)
        await updateBatchStatus(batchId, {
          status: 'failed',
          errorMessage: `PDF generation failed after 3 attempts: ${msg}`,
        })
        return
      }

      // Persist the storage path so retries skip generation
      const { error: pathError } = await supabase
        .from('print_batches')
        .update({ pdf_storage_path: pdfStoragePath })
        .eq('id', batchId)

      if (pathError) {
        console.warn(`[batch:${batchId.slice(0, 8)}] Failed to save pdf_storage_path (non-fatal):`, pathError.message)
      }
    }

    // ── Step 2: Download the PDF to a temp file ──────────────

    const { data: fileData, error: dlError } = await supabase.storage
      .from('print-batches')
      .download(pdfStoragePath)

    if (dlError || !fileData) {
      await updateBatchStatus(batchId, {
        status: 'failed',
        errorMessage: `Failed to download PDF: ${dlError?.message ?? 'unknown error'}`,
      })
      return
    }

    const tempDir = join(tmpdir(), 'olde-money-print-agent')
    await mkdir(tempDir, { recursive: true })
    const tempPath = join(tempDir, `batch-${batchId}.pdf`)
    const buffer = Buffer.from(await fileData.arrayBuffer())
    await writeFile(tempPath, buffer)
    console.log(`[batch:${batchId.slice(0, 8)}] PDF downloaded (${buffer.length} bytes)`)

    // ── Step 3: Submit to CUPS ─────────────────────────────

    await updateBatchStatus(batchId, {
      status: 'printing',
      pdfStoragePath: pdfStoragePath,
    })

    let ippJobId: string
    try {
      ippJobId = await retryWithBackoff(
        () => printPdf(tempPath, batch.roll_width_in, batch.estimated_length_in),
        `CUPS submit for batch ${batchId.slice(0, 8)}`
      )
      console.log(`[batch:${batchId.slice(0, 8)}] CUPS job: ${ippJobId}`)

      await updateBatchStatus(batchId, {
        status: 'printing',
        ippJobId,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[batch:${batchId.slice(0, 8)}] CUPS submit failed:`, msg)
      await updateBatchStatus(batchId, {
        status: 'failed',
        errorMessage: `CUPS submission failed after 3 attempts: ${msg}`,
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
