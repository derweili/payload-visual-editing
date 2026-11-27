import config from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'

export const getPayloadClient = () => getPayload({ config })

/**
 * Read options for every content query on the site, so draft handling lives in one place.
 *
 * - Published site: published content, no source maps; pages stay static.
 * - Draft Mode (preview from the admin): drafts, with source maps encoded by the visual editing
 *   plugin, so the overlay can link every value back to its field.
 *
 * Encoded reads are never cached across requests (`React.cache` is per request and keeps the
 * symbol-keyed source tags intact; a serializing cache would drop them).
 */
export const getReadOptions = cache(async () => {
  const { isEnabled: draft } = await draftMode()
  return {
    draft,
    overrideAccess: draft,
    context: draft ? { encodeSourceMaps: true } : {},
  } as const
})
