import type { CollectionConfig } from 'payload'

import { authenticated } from '@/lib/payload/access'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'email'], group: 'Settings' },
  access: { create: authenticated, read: authenticated, update: authenticated, delete: authenticated },
  fields: [{ name: 'name', type: 'text' }],
}
