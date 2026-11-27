import type { Block } from 'payload'

import { sectionIntroFields } from '@/fields/section-intro'

export const TeamBlock: Block = {
  slug: 'team',
  interfaceName: 'TeamBlock',
  labels: { singular: 'Team', plural: 'Teams' },
  fields: [
    ...sectionIntroFields(),
    {
      name: 'members',
      type: 'array',
      minRows: 1,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
            { name: 'role', type: 'text', admin: { width: '50%' } },
          ],
        },
        { name: 'photo', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
