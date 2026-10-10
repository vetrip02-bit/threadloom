import type { MetadataRoute } from 'next'

import { ALLOW_INDEXING, SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  // A deployment that still carries placeholder contact details, template
  // legal pages and sample pricing must not be indexed. Indexing is opt-in:
  // set NEXT_PUBLIC_ALLOW_INDEXING=true only once that content is real.
  if (!ALLOW_INDEXING) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Private and transactional routes stay out of the index.
        disallow: ['/account', '/signin', '/signup', '/api/'],
      },
    ],
    sitemap: SITE_URL + '/sitemap.xml',
    host: SITE_URL,
  }
}
