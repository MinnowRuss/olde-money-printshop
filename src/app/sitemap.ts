import type { MetadataRoute } from 'next'
import { SITE_BASE_URL } from '@/lib/constants/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    { url: SITE_BASE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_BASE_URL}/prices`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_BASE_URL}/calculator`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_BASE_URL}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_BASE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_BASE_URL}/auth/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_BASE_URL}/auth/register`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]
}
