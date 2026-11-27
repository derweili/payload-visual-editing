import type { Block } from 'payload'

import { linkField } from '@/fields/link'
import { sectionIntroFields } from '@/fields/section-intro'

export const FeaturedProjectsBlock: Block = {
  slug: 'featuredProjects',
  interfaceName: 'FeaturedProjectsBlock',
  labels: { singular: 'Featured projects', plural: 'Featured projects' },
  fields: [
    ...sectionIntroFields(),
    {
      name: 'source',
      type: 'radio',
      defaultValue: 'featured',
      options: [
        { label: 'Projects marked as featured', value: 'featured' },
        { label: 'Hand-picked', value: 'manual' },
      ],
      admin: { layout: 'horizontal' },
    },
    {
      name: 'projects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      admin: { condition: (_, sibling) => sibling?.source === 'manual' },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 9,
      admin: { condition: (_, sibling) => sibling?.source !== 'manual' },
    },
    { name: 'showLink', type: 'checkbox', label: 'Show a link below the projects' },
    {
      ...linkField({ required: false }),
      admin: { condition: (_, sibling) => Boolean(sibling?.showLink), hideGutter: true },
    },
  ],
}
