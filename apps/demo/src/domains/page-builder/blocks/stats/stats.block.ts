import type { Block } from 'payload'

import { sectionIntroFields } from '@/fields/section-intro'

/** Figures are numbers (not text), so they show how the overlay handles non-text values. */
export const statFields = [
  {
    type: 'row' as const,
    fields: [
      { name: 'prefix', type: 'text' as const, admin: { width: '20%' } },
      { name: 'value', type: 'number' as const, required: true, admin: { width: '30%' } },
      { name: 'suffix', type: 'text' as const, admin: { width: '20%', description: 'e.g. %, +, k' } },
    ],
  },
  { name: 'label', type: 'text' as const, required: true },
]

export const StatsBlock: Block = {
  slug: 'stats',
  interfaceName: 'StatsBlock',
  labels: { singular: 'Stats', plural: 'Stats' },
  fields: [...sectionIntroFields(), { name: 'items', type: 'array', minRows: 1, maxRows: 4, fields: statFields }],
}
