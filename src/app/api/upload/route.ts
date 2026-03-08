import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

// JPEG magic bytes: FF D8 FF
// TIFF magic bytes: 49 49 2A 00 (little-endian) or 4D 4D 00 2A (big-endian)
function detectMimeType(buffer: Buffer): string | null {
  if (buffer.length < 4) return null

  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg'
  }

  // TIFF little-endian
  if (
    buffer[0] === 0x49 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x2a &&
    buffer[3] === 0x00
  ) {
    return 'image/tiff'
  }

  // TIFF big-endian
  if (
    buffer[0] === 0x4d &&
    buffer[1] === 0x4d &&
    buffer[2] === 0x00 &&
    buffer[3] === 0x2a
  ) {
    return 'image/tiff'
  }

  return null
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const THUMB_WIDTH = 400

export async function POST(request: NextRequest) {
  // 1. Auth check
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Service client for storage writes
  const serviceClient = createServiceClient()
  if (!serviceClient) {
    return NextResponse.json(
      { error: 'Storage not configured' },
      { status: 500 }
    )
  }

  // 3. Parse form data
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // 4. Size check
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'File too large. Maximum size is 50 MB.' },
      { status: 413 }
    )
  }

  // 5. Read file buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // 6. Magic bytes validation
  const mimeType = detectMimeType(buffer)
  if (!mimeType) {
    return NextResponse.json(
      { error: 'Invalid file type. Only JPEG and TIFF files are accepted.' },
      { status: 400 }
    )
  }

  // 7. Sharp metadata + colorspace validation
  let metadata: sharp.Metadata
  try {
    metadata = await sharp(buffer).metadata()
  } catch {
    return NextResponse.json(
      { error: 'Could not read image metadata. File may be corrupted.' },
      { status: 400 }
    )
  }

  const space = metadata.space
  if (space && space !== 'srgb' && space !== 'rgb') {
    return NextResponse.json(
      {
        error: `Unsupported colorspace: ${space}. Please convert to sRGB before uploading.`,
      },
      { status: 400 }
    )
  }

  const width = metadata.width ?? 0
  const height = metadata.height ?? 0

  if (width === 0 || height === 0) {
    return NextResponse.json(
      { error: 'Could not determine image dimensions.' },
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
      { error: 'Failed to generate thumbnail.' },
      { status: 500 }
    )
  }

  // 9. Upload to storage
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
    console.error('Original upload failed:', uploadError)
    return NextResponse.json(
      { error: 'Failed to upload file.' },
      { status: 500 }
    )
  }

  // 10. Upload thumbnail
  const { error: thumbUploadError } = await serviceClient.storage
    .from('images')
    .upload(thumbPath, thumbBuffer, {
      contentType: 'image/jpeg',
      upsert: false,
    })

  if (thumbUploadError) {
    // Cleanup: remove original
    await serviceClient.storage.from('images').remove([storagePath])
    console.error('Thumbnail upload failed:', thumbUploadError)
    return NextResponse.json(
      { error: 'Failed to upload thumbnail.' },
      { status: 500 }
    )
  }

  // 11. Insert DB record (anon client, RLS enforced)
  const { data: image, error: dbError } = await supabase
    .from('images')
    .insert({
      id: imageId,
      user_id: user.id,
      filename: file.name,
      storage_path: storagePath,
      thumb_path: thumbPath,
      width,
      height,
      file_size: file.size,
      mime_type: mimeType,
    })
    .select()
    .single()

  if (dbError) {
    // Cleanup: remove both files
    await serviceClient.storage
      .from('images')
      .remove([storagePath, thumbPath])
    console.error('DB insert failed:', dbError)
    return NextResponse.json(
      { error: 'Failed to save image record.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ image }, { status: 201 })
}
