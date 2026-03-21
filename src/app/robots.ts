import type { MetadataRoute } from 'next'
import { SITE_BASE_URL } from '@/lib/constants/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/image/', '/order/', '/user/'],
    },
    sitemap: `${SITE_BASE_URL}/sitemap.xml`,
  }
}
