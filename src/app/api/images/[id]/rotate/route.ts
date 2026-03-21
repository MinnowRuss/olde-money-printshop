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
    .eq('user_id', user.id)
    .single()

  if (!image) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  // Service client for storage
  const serviceClient = createServiceClient()
  if (!serviceClient) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })
  }

  // Reject excessively large files to avoid memory issues
  if (image.file_size && image.file_size > MAX_IMAGE_PROCESS_SIZE) {
    return NextResponse.json(
      { error: 'Image is too large to rotate. Maximum file size for processing is 30 MB.' },
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

  // Rotate 90 degrees clockwise
  const rotatedBuffer = await sharp(buffer).rotate(90).toBuffer()

  // Get new dimensions
  const meta = await sharp(rotatedBuffer).metadata()
  const newWidth = meta.width ?? image.height
  const newHeight = meta.height ?? image.width

  // Re-upload original (upsert)
  const { error: uploadError } = await serviceClient.storage
    .from('images')
    .upload(image.storage_path, rotatedBuffer, {
      contentType: image.mime_type,
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: 'Failed to save rotated image' }, { status: 500 })
  }

  // Regenerate thumbnail
  const thumbBuffer = await sharp(rotatedBuffer)
    .resize({ width: 400, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer()

  await serviceClient.storage
    .from('images')
    .upload(image.thumbnail_path, thumbBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    })

  // Update dimensions in DB
  await supabase
    .from('images')
    .update({ width: newWidth, height: newHeight })
    .eq('id', id)

  return NextResponse.json({
    image: { ...image, width: newWidth, height: newHeight },
  })
}
