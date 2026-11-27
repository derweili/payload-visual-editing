import { slugField, type CollectionConfig } from 'payload'

import { statFields } from '@/domains/page-builder/blocks/stats/stats.block'
import { metaTab } from '@/fields/meta'
import { authenticated, authenticatedOrPublished } from '@/lib/payload/access'
import { previewURL } from '@/lib/payload/preview'
import { revalidateAfterChange, revalidateAfterDelete } from '@/lib/payload/revalidate'

import { projectCategories } from './projects.model'
import { projectPath } from './projects.paths'

/**
 * Case studies. Tabs, arrays, a group, numbers, a select, uploads and rich text: every kind of
 * field the visual editing overlay can link to.
 */
export const Projects: CollectionConfig<'projects'> = {
  slug: 'projects',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'client', 'category', 'year', '_status'],
    livePreview: { url: ({ data, req }) => previewURL(projectPath(data.slug), req) },
    preview: (data, { req }) => previewURL(projectPath(data.slug as string), req),
  },
  access: { read: authenticatedOrPublished, create: authenticated, update: authenticated, delete: authenticated },
  // What project cards need when a page or another project populates a project
  defaultPopulate: { title: true, slug: true, excerpt: true, client: true, category: true, year: true, coverImage: true },
  versions: { drafts: { autosave: { interval: 375 }, schedulePublish: false }, maxPerDoc: 25 },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            { name: 'excerpt', type: 'textarea', required: true, admin: { description: 'One or two sentences for cards and the header' } },
            { name: 'coverImage', type: 'upload', relationTo: 'media', required: true },
            {
              type: 'row',
              fields: [
                { name: 'client', type: 'text', required: true, admin: { width: '40%' } },
                { name: 'category', type: 'select', required: true, options: [...projectCategories], admin: { width: '30%' } },
                { name: 'year', type: 'number', required: true, min: 1990, max: 2100, admin: { width: '30%' } },
              ],
            },
            { name: 'services', type: 'array', fields: [{ name: 'name', type: 'text', required: true }] },
          ],
        },
        {
          label: 'Case study',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'challenge', type: 'textarea', admin: { width: '50%' } },
                { name: 'solution', type: 'textarea', admin: { width: '50%' } },
              ],
            },
            { name: 'results', type: 'array', maxRows: 4, fields: statFields },
            { name: 'body', type: 'richText' },
            {
              name: 'gallery',
              type: 'array',
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', required: true },
                { name: 'caption', type: 'text' },
              ],
            },
            {
              name: 'testimonial',
              type: 'group',
              fields: [
                { name: 'quote', type: 'textarea' },
                {
                  type: 'row',
                  fields: [
                    { name: 'author', type: 'text', admin: { width: '50%' } },
                    { name: 'role', type: 'text', admin: { width: '50%' } },
                  ],
                },
              ],
            },
          ],
        },
        metaTab,
      ],
    },
    slugField({ position: 'sidebar' }),
    {
      name: 'featured',
      type: 'checkbox',
      admin: { position: 'sidebar', description: 'Shown in “Featured projects” sections' },
    },
    {
      name: 'relatedProjects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      maxRows: 3,
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
      admin: { position: 'sidebar' },
    },
  ],
}
