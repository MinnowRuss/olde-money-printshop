import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_URL || 'https://printing.oldemoney.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/image/', '/order/', '/user/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
