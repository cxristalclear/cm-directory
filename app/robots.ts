import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/wip/', '/styleguide/'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
