'use client'

import { useState } from 'react'

export default function FooterSignup() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || 'Something went wrong. Please try again.')
      } else {
        setSuccess(true)
        setEmail('')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <p className="text-sm text-muted-foreground">Thanks for subscribing!</p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-11 flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-sm text-foreground placeholder:text-[color:var(--text-tertiary)] outline-none transition-[border-color,box-shadow,background-color] focus:border-primary focus:ring-3 focus:ring-ring"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading}
        className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_rgba(0,116,228,0.3)] transition-[background-color,transform] hover:-translate-y-px hover:bg-[var(--accent-primary-hover)] disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Subscribe'}
      </button>
      {error && (
        <p className="absolute mt-12 text-xs text-red-400">{error}</p>
      )}
    </form>
  )
}
