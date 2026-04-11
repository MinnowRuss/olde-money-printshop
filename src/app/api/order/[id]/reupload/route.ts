import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const ADMIN_EMAIL = 'admin@oldemoneyprint.shop'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const THUMB_WIDTH = 400

// JPEG magic bytes: FF D8 FF
// TIFF magic bytes: 49 49 2A 00 (LE) or 4D 4D 00 2A (BE)
function detectMimeType(buffer: Buffer): string | null {
  if (buffer.length < 4) return null
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
  if (
    buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2a && buffer[3] === 0x00
  ) return 'image/tiff'
  if (
    buffer[0] === 0x4d && buffer[1] === 0x4d && buffer[2] === 0x00 && buffer[3] === 0x2a
  ) return 'image/tiff'
  return null
}

/**
 * POST /api/order/[id]/reupload
 *
 * Customer-facing re-upload for a flagged order item. The customer provides
 * a replacement image for a specific `orderItemId`. On success:
 *   1. A new image record is created (owned by the customer)
 *   2. The `order_items.image_id` is updated to the new image
 *   3. The order's flag (`print_notes`) is cleared so it re-enters the
 *      "Awaiting Verification" queue
 *   4. An admin notification email is sent
 *
 * The order must be in `processing` status with a non-null `print_notes`
 * (i.e. flagged), and must belong to the authenticated user.
 *
 * Spec Ref: §4.1.7 / §8.1 (re-upload flow)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params

  // 1. Auth
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

  // 2. Fetch order and verify ownership + flagged state
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, user_id, status, print_notes')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ message: 'Order not found' }, { status: 404 })
  }

  if (order.user_id !== user.id) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  if (order.status !== 'processing' || !order.print_notes) {
    return NextResponse.json(
      { message: 'This order is not awaiting a re-upload.' },
      { status: 400 }
    )
  }

  // 3. Parse form data
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ message: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  const orderItemId = formData.get('orderItemId')

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ message: 'No file provided' }, { status: 400 })
  }

  if (typeof orderItemId !== 'string' || !orderItemId) {
    return NextResponse.json({ message: 'orderItemId is required' }, { status: 400 })
  }

  // 4. Verify orderItem belongs to this order
  const { data: orderItem, error: itemError } = await supabase
    .from('order_items')
    .select('id, order_id')
    .eq('id', orderItemId)
    .eq('order_id', orderId)
    .single()

  if (itemError || !orderItem) {
    return NextResponse.json(
      { message: 'Order item not found on this order' },
      { status: 404 }
    )
  }

  // 5. Size check
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { message: 'File too large. Maximum size is 50 MB.' },
      { status: 413 }
    )
  }

  // 6. Read buffer + magic-bytes validation
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const mimeType = detectMimeType(buffer)
  if (!mimeType) {
    return NextResponse.json(
      { message: 'Invalid file type. Only JPEG and TIFF files are accepted.' },
      { status: 400 }
    )
  }

  // 7. Sharp metadata + colorspace validation
  let metadata: sharp.Metadata
  try {
    metadata = await sharp(buffer).metadata()
  } catch {
    return NextResponse.json(
      { message: 'Could not read image metadata. File may be corrupted.' },
      { status: 400 }
    )
  }

  const space = metadata.space
  if (space && space !== 'srgb' && space !== 'rgb') {
    return NextResponse.json(
      {
        message: `Unsupported colorspace: ${space}. Please convert to sRGB before uploading.`,
      },
      { status: 422 }
    )
  }

  const width = metadata.width ?? 0
  const height = metadata.height ?? 0
  if (width === 0 || height === 0) {
    return NextResponse.json(
      { message: 'Could not determine image dimensions.' },
      { status: 400 }
    )
  }

  // 8. Generate thumbnail
  let thumbBuffer: Buffer
  try {
    thumbBuffer = await sharp(buffer)
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer()
  } catch {
    return NextResponse.json(
      { message: 'Failed to generate thumbnail.' },
      { status: 500 }
    )
  }

  // 9. Service client for storage writes
  const serviceClient = createServiceClient()
  if (!serviceClient) {
    return NextResponse.json({ message: 'Storage not configured' }, { status: 503 })
  }

  // 10. Upload original + thumb
  const imageId = randomUUID()
  const ext = mimeType === 'image/tiff' ? 'tiff' : 'jpg'
  const storagePath = `${user.id}/${imageId}/original.${ext}`
  const thumbPath = `${user.id}/${imageId}/thumb.jpg`

  const { error: uploadError } = await serviceClient.storage
    .from('images')
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    })

  if (uploadError) {
    console.error('Re-upload original failed:', uploadError)
    return NextResponse.json({ message: 'Failed to upload file.' }, { status: 500 })
  }

  const { error: thumbUploadError } = await serviceClient.storage
    .from('images')
    .upload(thumbPath, thumbBuffer, {
      contentType: 'image/jpeg',
      upsert: false,
    })

  if (thumbUploadError) {
    await serviceClient.storage.from('images').remove([storagePath])
    console.error('Re-upload thumbnail failed:', thumbUploadError)
    return NextResponse.json(
      { message: 'Failed to upload thumbnail.' },
      { status: 500 }
    )
  }

  // 11. Insert image record (anon client, RLS enforced)
  const { data: image, error: dbError } = await supabase
    .from('images')
    .insert({
      id: imageId,
      user_id: user.id,
      filename: file.name,
      storage_path: storagePath,
      thumbnail_path: thumbPath,
      width,
      height,
      file_size: file.size,
      mime_type: mimeType,
    })
    .select()
    .single()

  if (dbError || !image) {
    await serviceClient.storage.from('images').remove([storagePath, thumbPath])
    console.error('Re-upload DB insert failed:', dbError)
    return NextResponse.json(
      { message: 'Failed to save image record.' },
      { status: 500 }
    )
  }

  // 12. Update order_item to point at new image (service client — crosses RLS)
  const { error: itemUpdateError } = await serviceClient
    .from('order_items')
    .update({ image_id: imageId })
    .eq('id', orderItemId)

  if (itemUpdateError) {
    console.error('Re-upload order_item update failed:', itemUpdateError)
    return NextResponse.json(
      { message: 'Failed to attach new image to order item.' },
      { status: 500 }
    )
  }

  // 13. Clear the flag so the order re-enters the verification queue
  const { error: orderUpdateError } = await serviceClient
    .from('orders')
    .update({
      print_notes: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (orderUpdateError) {
    console.error('Re-upload order flag clear failed:', orderUpdateError)
    // Don't fail the request — the image is attached, admin can clear manually
  }

  // 14. Notify admin via email
  if (resend) {
    try {
      const orderNum = orderId.slice(0, 8).toUpperCase()
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ?? 'https://oldemoneyprint.shop'

      await resend.emails.send({
        from: 'Olde Money Printshop <orders@oldemoneyprint.shop>',
        to: ADMIN_EMAIL,
        subject: `Re-upload received — Order #${orderNum} ready for re-verification`,
        html: `
          <h1>Customer re-uploaded a flagged image</h1>
          <p>The customer for order <strong>#${orderNum}</strong> has submitted a replacement image and the flag has been cleared.</p>
          <p>The order is now back in the <strong>Awaiting Verification</strong> queue and needs your review.</p>
          <p><a href="${baseUrl}/admin/orders/${orderId}">Open order in admin &rarr;</a></p>
          <p>— Olde Money Printshop</p>
        `,
      })
    } catch (emailErr) {
      console.error('Failed to send re-upload admin notification:', emailErr)
      // Don't fail the request
    }
  }

  return NextResponse.json({
    message: 'Re-upload received',
    image,
  })
}
