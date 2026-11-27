/** /projects is a CMS page too (slug `projects`), so editors compose it with blocks. */
import type { Metadata } from 'next'

import { PageView } from '@/domains/pages/components/page-view'
import { getPageBySlug } from '@/domains/pages/pages.queries'
import { PROJECTS_PATH, PROJECTS_SLUG } from '@/domains/projects/projects.paths'
import { toMetadata } from '@/lib/metadata'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug(PROJECTS_SLUG)
  return toMetadata(page?.meta, { title: page?.title ?? 'Projects', path: PROJECTS_PATH })
}

export default function ProjectsPage() {
  return <PageView slug={PROJECTS_SLUG} />
}
