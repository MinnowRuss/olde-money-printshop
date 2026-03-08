import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AddressForm, PasswordForm } from './ProfileForms'

export const metadata = { title: 'Your Profile — Olde Money Printshop' }

export default async function UserProfilePage() {
  const supabase = await createClient()

  // Middleware should catch this, but belt-and-suspenders
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, address_line1, address_line2, city, state, zip, country')
    .eq('id', user.id)
    .single()

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900">
        Your profile
      </h1>
      <div className="space-y-6">
        <AddressForm profile={profile ?? {
          full_name: null,
          address_line1: null,
          address_line2: null,
          city: null,
          state: null,
          zip: null,
          country: 'US',
        }} />
        <PasswordForm />
      </div>
    </div>
  )
}
