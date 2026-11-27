import type { Block } from 'payload'

import { linksField } from '@/fields/link'
import { sectionIntroFields } from '@/fields/section-intro'

export const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    ...sectionIntroFields({ headingRequired: true }),
    linksField(),
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'split',
      options: [
        { label: 'Text and image side by side', value: 'split' },
        { label: 'Centered text, image below', value: 'centered' },
      ],
    },
  ],
}
