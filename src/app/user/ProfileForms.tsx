'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Profile = {
  full_name: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <p className={`rounded-md px-3 py-2 text-sm ${type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
      {message}
    </p>
  )
}

export function AddressForm({ profile }: { profile: Profile }) {
  const [form, setForm] = useState<Profile>({
    full_name: profile.full_name ?? '',
    address_line1: profile.address_line1 ?? '',
    address_line2: profile.address_line2 ?? '',
    city: profile.city ?? '',
    state: profile.state ?? '',
    zip: profile.zip ?? '',
    country: profile.country ?? 'US',
  })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  function set(field: keyof Profile) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setToast(null)
    setLoading(true)

    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setLoading(false)
    if (res.ok) {
      setToast({ message: 'Address saved.', type: 'success' })
    } else {
      const data = await res.json()
      setToast({ message: data.error ?? 'Something went wrong.', type: 'error' })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping address</CardTitle>
        <CardDescription>Used as the default address for your orders.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {toast && <Toast {...toast} />}
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" value={form.full_name ?? ''} onChange={set('full_name')} placeholder="Jane Smith" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_line1">Address line 1</Label>
            <Input id="address_line1" value={form.address_line1 ?? ''} onChange={set('address_line1')} placeholder="123 Main St" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_line2">Address line 2</Label>
            <Input id="address_line2" value={form.address_line2 ?? ''} onChange={set('address_line2')} placeholder="Apt 4B (optional)" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={form.city ?? ''} onChange={set('city')} placeholder="Brooklyn" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" value={form.state ?? ''} onChange={set('state')} placeholder="NY" maxLength={2} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP code</Label>
              <Input id="zip" value={form.zip ?? ''} onChange={set('zip')} placeholder="11201" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={form.country ?? ''} onChange={set('country')} placeholder="US" maxLength={2} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Save address'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setToast(null)

    if (newPassword !== confirmPassword) {
      setToast({ message: 'New passwords do not match.', type: 'error' })
      return
    }
    if (newPassword.length < 8) {
      setToast({ message: 'New password must be at least 8 characters.', type: 'error' })
      return
    }

    setLoading(true)
    const supabase = createClient()

    // Re-authenticate with current password to verify it before changing
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      setToast({ message: 'Could not verify your identity.', type: 'error' })
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })
    if (signInError) {
      setToast({ message: 'Current password is incorrect.', type: 'error' })
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)

    if (error) {
      setToast({ message: error.message, type: 'error' })
    } else {
      setToast({ message: 'Password updated.', type: 'success' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>Choose a strong password of at least 8 characters.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {toast && <Toast {...toast} />}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
