import type { Block } from 'payload'

export const TestimonialBlock: Block = {
  slug: 'testimonial',
  interfaceName: 'TestimonialBlock',
  labels: { singular: 'Testimonial', plural: 'Testimonials' },
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    {
      type: 'row',
      fields: [
        { name: 'author', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'role', type: 'text', admin: { width: '50%' } },
      ],
    },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
  ],
}
