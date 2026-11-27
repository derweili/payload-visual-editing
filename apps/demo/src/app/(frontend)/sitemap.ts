import type { MetadataRoute } from 'next'

import { HOME_SLUG, pagePath } from '@/domains/pages/pages.paths'
import { getPageSlugs } from '@/domains/pages/pages.queries'
import { projectPath } from '@/domains/projects/projects.paths'
import { getProjectSlugs } from '@/domains/projects/projects.queries'
import { getServerURL } from '@/lib/server-url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, projects] = await Promise.all([getPageSlugs(), getProjectSlugs()])
  const url = getServerURL()
  return [
    ...pages.map((slug) => ({ url: `${url}${pagePath(slug)}`, priority: slug === HOME_SLUG ? 1 : 0.8 })),
    ...projects.map((slug) => ({ url: `${url}${projectPath(slug)}`, priority: 0.6 })),
  ]
}
