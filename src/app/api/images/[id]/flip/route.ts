import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { MAX_IMAGE_PROCESS_SIZE } from '@/lib/constants/site'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Auth
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

  // Verify ownership
  const { data: image } = await supabase
    .from('images')
    .select('*')
    .eq('id', id)
    .single()

  if (!image) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  if (image.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Service client for storage
  const serviceClient = createServiceClient()
  if (!serviceClient) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })
  }

  // Reject excessively large files to avoid memory issues
  if (image.file_size && image.file_size > MAX_IMAGE_PROCESS_SIZE) {
    return NextResponse.json(
      { error: 'Image is too large to flip. Maximum file size for processing is 30 MB.' },
      { status: 413 }
    )
  }

  // Download original
  const { data: fileData, error: downloadError } = await serviceClient.storage
    .from('images')
    .download(image.storage_path)

  if (downloadError || !fileData) {
    return NextResponse.json({ error: 'Failed to download image' }, { status: 500 })
  }

  const buffer = Buffer.from(await fileData.arrayBuffer())

  // Flip vertically
  const flippedBuffer = await sharp(buffer).flip().toBuffer()

  // Re-upload original (upsert)
  const { error: uploadError } = await serviceClient.storage
    .from('images')
    .upload(image.storage_path, flippedBuffer, {
      contentType: image.mime_type,
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: 'Failed to save flipped image' }, { status: 500 })
  }

  // Regenerate thumbnail
  const thumbBuffer = await sharp(flippedBuffer)
    .resize({ width: 400, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer()

  await serviceClient.storage
    .from('images')
    .upload(image.thumbnail_path, thumbBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    })

  return NextResponse.json({ image })
}
