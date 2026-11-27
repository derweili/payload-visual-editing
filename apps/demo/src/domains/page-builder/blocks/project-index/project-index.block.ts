import type { Block } from 'payload'

import { sectionIntroFields } from '@/fields/section-intro'

/** All projects, with category filters. Put it on the page with the slug `projects`. */
export const ProjectIndexBlock: Block = {
  slug: 'projectIndex',
  interfaceName: 'ProjectIndexBlock',
  labels: { singular: 'Project index', plural: 'Project indexes' },
  fields: [...sectionIntroFields(), { name: 'showFilters', type: 'checkbox', defaultValue: true }],
}
