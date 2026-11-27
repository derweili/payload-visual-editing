import 'server-only'

import { cache } from 'react'

import { getPayloadClient, getReadOptions } from '@/lib/payload/client'

export const getHeader = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'header', depth: 1, ...(await getReadOptions()) })
})

export const getFooter = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'footer', depth: 1, ...(await getReadOptions()) })
})
