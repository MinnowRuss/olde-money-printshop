import type { Metadata } from 'next'
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { SITE_BASE_URL } from '@/lib/constants/site'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const appSans = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})

const appMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_BASE_URL),
  title: {
    default: 'Olde Money Printing',
    template: '%s | Olde Money Printing',
  },
  description:
    'Museum-quality photo prints on canvas, metal, acrylic, and fine art paper. Upload, customize, and order with volume discounts.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Olde Money Printing',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${appSans.variable} ${appMono.variable} antialiased`}>
        <Navbar />
        <main className="min-h-[calc(100dvh-var(--navbar-h,3.5rem)-var(--footer-h,5rem))]">
          {children}
        </main>
        <Footer />
        <Analytics />
        <SpeedInsights />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  )
}
