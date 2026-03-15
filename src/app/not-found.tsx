import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="text-6xl font-bold text-zinc-200">404</p>
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Page not found
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Sorry, the page you&apos;re looking for doesn&apos;t exist or has
            been moved.
          </p>
        </div>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}
