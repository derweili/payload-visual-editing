import type { Field } from 'payload'

/** Eyebrow, heading and description: the intro most sections share. */
export const sectionIntroFields = ({ headingRequired = false } = {}): Field[] => [
  { name: 'eyebrow', type: 'text', admin: { description: 'Small label above the heading' } },
  { name: 'heading', type: 'text', required: headingRequired },
  { name: 'description', type: 'textarea' },
]
