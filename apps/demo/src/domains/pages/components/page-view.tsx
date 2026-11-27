import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/domains/page-builder/render-blocks'

import { getPageBySlug } from '../pages.queries'

/** A page from the CMS, by slug. Used by the homepage, /projects and every other page route. */
export async function PageView({ slug }: { slug: string }) {
  const page = await getPageBySlug(slug)
  if (!page) notFound()
  return <RenderBlocks blocks={page.layout} />
}
