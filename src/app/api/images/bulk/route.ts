import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function DELETE(request: NextRequest) {
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

  // Parse body
  let ids: string[]
  try {
    const body = await request.json()
    ids = body.ids
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No image IDs provided' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Verify all images belong to current user
  const { data: images } = await supabase
    .from('images')
    .select('id, storage_path, thumb_path')
    .eq('user_id', user.id)
    .in('id', ids)

  if (!images || images.length === 0) {
    return NextResponse.json({ error: 'No images found' }, { status: 404 })
  }

  // Service client for storage deletes
  const serviceClient = createServiceClient()
  if (!serviceClient) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })
  }

  // Delete files from storage
  const filePaths = images.flatMap((img) => [img.storage_path, img.thumb_path])
  await serviceClient.storage.from('images').remove(filePaths)

  // Delete records from DB (RLS enforced)
  const verifiedIds = images.map((img) => img.id)
  await supabase.from('images').delete().in('id', verifiedIds)

  return NextResponse.json({
    deleted: verifiedIds.length,
  })
}
