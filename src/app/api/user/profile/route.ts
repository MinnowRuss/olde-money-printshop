import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()

  if (!supabase) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 })
  }

  const ALLOWED_FIELDS = ['full_name', 'address_line1', 'address_line2', 'city', 'state', 'zip', 'country'] as const
  const MAX_LENGTH: Record<string, number> = {
    full_name: 200,
    address_line1: 300,
    address_line2: 300,
    city: 100,
    state: 100,
    zip: 20,
    country: 100,
  }

  const parsed = body as Record<string, unknown>
  const extraFields = Object.keys(parsed).filter(k => !(ALLOWED_FIELDS as readonly string[]).includes(k))
  if (extraFields.length > 0) {
    return NextResponse.json({ error: `Unknown fields: ${extraFields.join(', ')}` }, { status: 400 })
  }

  const update: Record<string, string> = {}
  for (const field of ALLOWED_FIELDS) {
    if (field in parsed) {
      const value = parsed[field]
      if (value !== null && typeof value !== 'string') {
        return NextResponse.json({ error: `${field} must be a string or null` }, { status: 400 })
      }
      if (typeof value === 'string' && value.length > MAX_LENGTH[field]) {
        return NextResponse.json({ error: `${field} exceeds max length of ${MAX_LENGTH[field]}` }, { status: 400 })
      }
      if (typeof value === 'string') {
        update[field] = value.trim()
      }
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { error } = await supabase
    .from('profiles')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
