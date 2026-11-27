import 'server-only'

import { cache } from 'react'

import { getPayloadClient, getReadOptions } from '@/lib/payload/client'

export const getPageBySlug = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    ...(await getReadOptions()),
  })
  return docs[0] ?? null
})

/** Published slugs, for static generation (build time: no Draft Mode). */
export async function getPageSlugs(): Promise<string[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: { _status: { equals: 'published' } },
    select: { slug: true },
    limit: 1000,
    pagination: false,
    overrideAccess: false,
  })
  return docs.map((doc) => doc.slug)
}
