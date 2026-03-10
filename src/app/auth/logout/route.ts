import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  if (supabase) await supabase.auth.signOut()
  // Use 303 to convert POST → GET so the browser doesn't POST to /
  return NextResponse.redirect(new URL('/', request.url), 303)
}
