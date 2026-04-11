/**
 * Batch PDF Renderer
 *
 * Takes a nesting manifest (from the NFDH nesting engine) and renders
 * a production-ready PDF for the Epson SC-P9500.
 *
 * - Downloads images one at a time from Supabase Storage (memory-safe)
 * - Places each image at manifest coordinates converted to PDF points
 * - Draws thin L-shaped crop marks at each image corner
 * - Handles 90° rotation for images the nesting engine rotated
 * - Streams output to a temp file, then uploads to Supabase Storage
 *
 * Spec Ref: §4.4 — Print Job Dispatcher / PDF Generation
 * 1 inch = 72 PDF points (per PDF specification)
 */

import PDFDocument from 'pdfkit'
import { createWriteStream } from 'node:fs'
import { readFile, unlink, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createClient } from '@supabase/supabase-js'
import { config } from './config.js'

// ── Constants ──────────────────────────────────────────────────

const PTS_PER_INCH = 72

/** Crop mark line length (0.25 inches) */
const MARK_LENGTH_PTS = 0.25 * PTS_PER_INCH

/** Gap between image edge and start of crop mark (1/16 inch) */
const MARK_OFFSET_PTS = 0.0625 * PTS_PER_INCH

/** Crop mark stroke weight */
const MARK_WEIGHT_PTS = 0.5

/** Supabase Storage bucket where customer images live */
const IMAGES_BUCKET = 'images'

/** Supabase Storage bucket where batch PDFs are uploaded */
const BATCHES_BUCKET = 'print-batches'

// ── Types (matching nesting engine output stored in print_batches.manifest) ──

export interface PlacedItem {
  orderItemId: string
  orderId: string
  x: number       // inches from left edge of roll
  y: number       // inches from top of roll
  widthIn: number  // placed width (already swapped if rotated)
  heightIn: number // placed height (already swapped if rotated)
  rotation: 0 | 90
  imageStoragePath: string
}

export interface NestingManifest {
  placements: PlacedItem[]
  rollWidthIn: number
  totalLengthIn: number
  wastePercent: number
  strips: unknown[]
}

// ── Main renderer ──────────────────────────────────────────────

/**
 * Generate a batch PDF from the nesting manifest and upload to Supabase Storage.
 *
 * @returns The storage path within the `print-batches` bucket (e.g. "{batchId}/batch.pdf")
 */
export async function renderBatchPdf(
  batchId: string,
  manifest: NestingManifest,
  rollWidthIn: number
): Promise<string> {
  const tag = `[pdf:${batchId.slice(0, 8)}]`
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey)

  const pageWidthPts = rollWidthIn * PTS_PER_INCH
  const pageLengthPts = manifest.totalLengthIn * PTS_PER_INCH

  console.log(
    `${tag} Rendering PDF: ${rollWidthIn}"×${manifest.totalLengthIn}" ` +
    `(${pageWidthPts}×${pageLengthPts} pts), ${manifest.placements.length} items`
  )

  // Create PDF with exact roll dimensions, no margins
  const doc = new PDFDocument({
    size: [pageWidthPts, pageLengthPts],
    margin: 0,
    autoFirstPage: true,
  })

  // Stream to a temp file (memory-safe — no buffering the entire PDF)
  const tempDir = join(tmpdir(), 'olde-money-print-agent')
  await mkdir(tempDir, { recursive: true })
  const tempPath = join(tempDir, `batch-${batchId}.pdf`)
  const writeStream = createWriteStream(tempPath)
  doc.pipe(writeStream)

  // Process each placement sequentially (one image in memory at a time)
  let placed = 0
  let skipped = 0

  for (const item of manifest.placements) {
    if (!item.imageStoragePath) {
      console.warn(`${tag} Item ${item.orderItemId} has no image path — skipping`)
      skipped++
      continue
    }

    // Download image from Supabase Storage
    let imageBuffer: Buffer
    try {
      imageBuffer = await downloadImage(supabase, item.imageStoragePath, tag)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`${tag} Failed to download ${item.imageStoragePath}: ${msg}`)
      skipped++
      continue
    }

    // Convert placement coordinates to PDF points
    const xPts = item.x * PTS_PER_INCH
    const yPts = item.y * PTS_PER_INCH
    const wPts = item.widthIn * PTS_PER_INCH
    const hPts = item.heightIn * PTS_PER_INCH

    // Place image (with rotation if needed)
    if (item.rotation === 90) {
      // Rotate 90° clockwise: translate to top-right corner of bounding box,
      // rotate CW, then draw with swapped local dimensions so the image
      // fills the bounding box exactly.
      doc.save()
      doc.translate(xPts + wPts, yPts)
      doc.rotate(-90)
      doc.image(imageBuffer, 0, 0, { width: hPts, height: wPts })
      doc.restore()
    } else {
      doc.image(imageBuffer, xPts, yPts, { width: wPts, height: hPts })
    }

    // Draw L-shaped crop marks at all four corners
    drawCropMarks(doc, xPts, yPts, wPts, hPts)

    placed++
  }

  // Finalize PDF
  doc.end()

  // Wait for the write stream to flush
  await new Promise<void>((resolve, reject) => {
    writeStream.on('finish', resolve)
    writeStream.on('error', reject)
  })

  console.log(`${tag} PDF written to temp file (${placed} placed, ${skipped} skipped)`)

  // Read the temp file and upload to Supabase Storage
  const pdfBuffer = await readFile(tempPath)
  const storagePath = `${batchId}/batch.pdf`

  const { error: uploadError } = await supabase.storage
    .from(BATCHES_BUCKET)
    .upload(storagePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadError) {
    // Clean up temp file before throwing
    await unlink(tempPath).catch(() => {})
    throw new Error(`Failed to upload PDF to storage: ${uploadError.message}`)
  }

  // Clean up temp file
  await unlink(tempPath).catch(() => {})

  console.log(`${tag} PDF uploaded to ${BATCHES_BUCKET}/${storagePath} (${pdfBuffer.length} bytes)`)
  return storagePath
}

// ── Image download with retry ──────────────────────────────────

/**
 * Download an image from Supabase Storage with 3 retries and 10s backoff
 * (per spec §7.3 — transient download failure handling).
 */
async function downloadImage(
  supabase: { storage: { from: (bucket: string) => { download: (path: string) => Promise<{ data: Blob | null; error: { message: string } | null }> } } },
  storagePath: string,
  tag: string
): Promise<Buffer> {
  const MAX_RETRIES = 3
  const RETRY_DELAY_MS = 10_000

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const { data, error } = await supabase.storage
      .from(IMAGES_BUCKET)
      .download(storagePath)

    if (data) {
      return Buffer.from(await data.arrayBuffer())
    }

    if (attempt < MAX_RETRIES) {
      console.warn(
        `${tag} Image download attempt ${attempt}/${MAX_RETRIES} failed ` +
        `(${error?.message ?? 'unknown'}), retrying in ${RETRY_DELAY_MS / 1000}s...`
      )
      await sleep(RETRY_DELAY_MS)
    } else {
      throw new Error(error?.message ?? 'Download failed after retries')
    }
  }

  // Unreachable, but TypeScript needs it
  throw new Error('Download failed')
}

// ── Crop marks ─────────────────────────────────────────────────

/**
 * Draw thin L-shaped crop marks at all four corners of an image placement.
 * Marks are offset slightly from the image edge so they don't overlap the print.
 *
 * Each corner gets two short lines forming an "L":
 *   Top-left:     horizontal left + vertical up
 *   Top-right:    horizontal right + vertical up
 *   Bottom-left:  horizontal left + vertical down
 *   Bottom-right: horizontal right + vertical down
 */
function drawCropMarks(
  doc: InstanceType<typeof PDFDocument>,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  doc.save()
  doc.lineWidth(MARK_WEIGHT_PTS)
  doc.strokeColor('#000000')

  const o = MARK_OFFSET_PTS
  const l = MARK_LENGTH_PTS

  // Top-left
  doc.moveTo(x - o - l, y).lineTo(x - o, y).stroke()
  doc.moveTo(x, y - o - l).lineTo(x, y - o).stroke()

  // Top-right
  doc.moveTo(x + w + o, y).lineTo(x + w + o + l, y).stroke()
  doc.moveTo(x + w, y - o - l).lineTo(x + w, y - o).stroke()

  // Bottom-left
  doc.moveTo(x - o - l, y + h).lineTo(x - o, y + h).stroke()
  doc.moveTo(x, y + h + o).lineTo(x, y + h + o + l).stroke()

  // Bottom-right
  doc.moveTo(x + w + o, y + h).lineTo(x + w + o + l, y + h).stroke()
  doc.moveTo(x + w, y + h + o).lineTo(x + w, y + h + o + l).stroke()

  doc.restore()
}

// ── Util ───────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
