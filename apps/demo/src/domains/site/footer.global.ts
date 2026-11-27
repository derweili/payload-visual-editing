import type { GlobalConfig } from 'payload'

import { linkField } from '@/fields/link'
import { anyone } from '@/lib/payload/access'
import { previewURL } from '@/lib/payload/preview'
import { revalidateGlobal } from '@/lib/payload/revalidate'

export const Footer: GlobalConfig = {
  slug: 'footer',
  admin: { group: 'Site', livePreview: { url: ({ req }) => previewURL('/', req) } },
  access: { read: anyone },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    { name: 'tagline', type: 'textarea' },
    {
      name: 'columns',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'links', type: 'array', fields: [linkField()] },
      ],
    },
    { name: 'legal', type: 'text', admin: { description: 'e.g. © 2026 Lumora' } },
  ],
}
