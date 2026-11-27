import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '@/lib/payload/access'

/** Images. On Vercel the files live in Vercel Blob (see payload.config.ts), locally in ./media. */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  upload: { mimeTypes: ['image/*'], focalPoint: true },
  fields: [{ name: 'alt', type: 'text', required: true }],
}
