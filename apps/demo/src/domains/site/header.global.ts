import type { GlobalConfig } from 'payload'

import { linkField } from '@/fields/link'
import { anyone } from '@/lib/payload/access'
import { previewURL } from '@/lib/payload/preview'
import { revalidateGlobal } from '@/lib/payload/revalidate'

export const Header: GlobalConfig = {
  slug: 'header',
  admin: { group: 'Site', livePreview: { url: ({ req }) => previewURL('/', req) } },
  access: { read: anyone },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    { name: 'brand', type: 'text', required: true, defaultValue: 'Lumora' },
    { name: 'navItems', type: 'array', maxRows: 6, fields: [linkField()] },
    linkField({ name: 'cta', required: false }),
  ],
}
