import type { Block } from 'payload'

import { sectionIntroFields } from '@/fields/section-intro'

export const featureIcons = ['compass', 'layers', 'code', 'chart', 'shield', 'sparkles', 'users', 'rocket'] as const

export const FeaturesBlock: Block = {
  slug: 'features',
  interfaceName: 'FeaturesBlock',
  labels: { singular: 'Features', plural: 'Features' },
  fields: [
    ...sectionIntroFields(),
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'icon', type: 'select', defaultValue: 'sparkles', options: [...featureIcons] },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
  ],
}
