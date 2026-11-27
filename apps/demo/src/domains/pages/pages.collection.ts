import { slugField, type CollectionConfig } from 'payload'

import { pageBlocks } from '@/domains/page-builder/blocks'
import { metaTab } from '@/fields/meta'
import { authenticated, authenticatedOrPublished } from '@/lib/payload/access'
import { previewURL } from '@/lib/payload/preview'
import { revalidateAfterChange, revalidateAfterDelete } from '@/lib/payload/revalidate'

import { pagePath } from './pages.paths'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    livePreview: { url: ({ data, req }) => previewURL(pagePath(data.slug), req) },
    preview: (data, { req }) => previewURL(pagePath(data.slug as string), req),
  },
  access: { read: authenticatedOrPublished, create: authenticated, update: authenticated, delete: authenticated },
  // What links and relationships get when they populate a page
  defaultPopulate: { title: true, slug: true },
  versions: { drafts: { autosave: { interval: 375 }, schedulePublish: false }, maxPerDoc: 25 },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        { label: 'Content', fields: [{ name: 'layout', type: 'blocks', blocks: pageBlocks, required: true }] },
        metaTab,
      ],
    },
    slugField({ position: 'sidebar' }),
  ],
}
