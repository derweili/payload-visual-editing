import type { Block } from 'payload'

export const LogoCloudBlock: Block = {
  slug: 'logoCloud',
  interfaceName: 'LogoCloudBlock',
  labels: { singular: 'Logo cloud', plural: 'Logo clouds' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'clients', type: 'array', minRows: 1, fields: [{ name: 'name', type: 'text', required: true }] },
  ],
}
