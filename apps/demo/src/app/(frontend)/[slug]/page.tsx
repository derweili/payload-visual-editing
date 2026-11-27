import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'

import { PageView } from '@/domains/pages/components/page-view'
import { HOME_SLUG, pagePath } from '@/domains/pages/pages.paths'
import { PROJECTS_SLUG } from '@/domains/projects/projects.paths'
import { getPageBySlug, getPageSlugs } from '@/domains/pages/pages.queries'
import { toMetadata } from '@/lib/metadata'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getPageSlugs()).filter((slug) => slug !== HOME_SLUG && slug !== PROJECTS_SLUG).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  return page ? toMetadata(page.meta, { title: page.title, path: pagePath(slug) }) : {}
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  if (slug === HOME_SLUG) permanentRedirect('/')
  return <PageView slug={slug} />
}
