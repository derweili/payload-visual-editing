import type { Block } from 'payload'

import { linksField } from '@/fields/link'

export const CtaBlock: Block = {
  slug: 'cta',
  interfaceName: 'CtaBlock',
  labels: { singular: 'Call to action', plural: 'Calls to action' },
  fields: [{ name: 'heading', type: 'text', required: true }, { name: 'description', type: 'textarea' }, linksField()],
}
