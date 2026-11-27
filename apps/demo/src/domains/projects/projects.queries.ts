import 'server-only'

import { cache } from 'react'

import { getPayloadClient, getReadOptions } from '@/lib/payload/client'

/** A project with everything the detail page renders. */
export const getProjectBySlug = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    ...(await getReadOptions()),
  })
  return docs[0] ?? null
})

/** Projects for cards, newest first. `featured` limits to projects marked as featured. */
export const getProjects = cache(async ({ featured = false, limit = 100 }: { featured?: boolean; limit?: number } = {}) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'projects',
    where: featured ? { featured: { equals: true } } : undefined,
    sort: ['-year', '-createdAt'],
    limit,
    depth: 1,
    ...(await getReadOptions()),
  })
  return docs
})

/** Published slugs, for static generation (build time: no Draft Mode). */
export async function getProjectSlugs(): Promise<string[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'projects',
    where: { _status: { equals: 'published' } },
    select: { slug: true },
    limit: 1000,
    pagination: false,
    overrideAccess: false,
  })
  return docs.map((doc) => doc.slug)
}
