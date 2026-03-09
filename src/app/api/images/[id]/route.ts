import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function DELETE(
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
    .select('id, storage_path, thumb_path, user_id')
    .eq('id', id)
    .single()

  if (!image) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  if (image.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Service client for storage deletes
  const serviceClient = createServiceClient()
  if (!serviceClient) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })
  }

  // Delete files from storage
  await serviceClient.storage
    .from('images')
    .remove([image.storage_path, image.thumb_path])

  // Delete DB record (RLS enforced)
  await supabase.from('images').delete().eq('id', id)

  return NextResponse.json({ deleted: id })
}
