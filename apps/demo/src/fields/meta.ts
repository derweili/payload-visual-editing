import type { Tab } from 'payload'

/** SEO tab: a named tab, so the data lives under `meta`. Falls back to the document's title. */
export const metaTab: Tab = {
  name: 'meta',
  label: 'SEO',
  fields: [
    { name: 'title', type: 'text', admin: { description: 'Defaults to the document title.' } },
    { name: 'description', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}
