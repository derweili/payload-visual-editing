import type { Metadata } from 'next'

import { PageView } from '@/domains/pages/components/page-view'
import { HOME_SLUG } from '@/domains/pages/pages.paths'
import { getPageBySlug } from '@/domains/pages/pages.queries'
import { toMetadata } from '@/lib/metadata'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug(HOME_SLUG)
  const metadata = toMetadata(page?.meta, { title: 'Home', path: '/' })
  // The homepage uses the site name as its title
  return { ...metadata, title: { absolute: String(metadata.title) } }
}

export default function HomePage() {
  return <PageView slug={HOME_SLUG} />
}
