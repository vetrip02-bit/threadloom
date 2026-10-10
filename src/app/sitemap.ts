import type { MetadataRoute } from 'next'

import { CATEGORIES } from '@/data/catalog'
import { SITE_URL } from '@/lib/site'

// Required by `output: 'export'` - this file is emitted at build time.
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: Array<{
    path: string
    priority: number
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  }> = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    { path: '/uniforms', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/industries', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/customization', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/quote', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.6, changeFrequency: 'yearly' },
    { path: '/contact', priority: 0.7, changeFrequency: 'yearly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  ]

  return [
    ...staticRoutes.map((route) => ({
      url: SITE_URL + route.path,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...CATEGORIES.map((category) => ({
      url: SITE_URL + '/uniforms/' + category.slug,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    })),
  ]
}
