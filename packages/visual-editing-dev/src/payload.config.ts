/**
 * Test app config: every field shape the plugin supports (named and unnamed tabs, nested arrays,
 * groups, collapsible + row, blocks, localized fields, Lexical, an upload, a number, a relationship,
 * a localized global), with Live Preview on the page and the global.
 */
import path from 'path'
import { fileURLToPath } from 'url'

import { visualEditingPlugin } from '@derweili/payload-visual-editing/server'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig, type CollectionConfig, type GlobalConfig } from 'payload'

import { getD1 } from './db'
import { seed } from './seed'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** Live Preview: the page in Draft Mode, in the admin's locale. */
const previewURL = ({ locale, req }: { locale: { code: string }; req: { url?: string } }) => {
  const origin = req.url ? new URL(req.url).origin : ''
  return `${origin}/next/preview?path=${encodeURIComponent(`/?locale=${locale.code}`)}`
}

const Users: CollectionConfig = { slug: 'users', auth: true, fields: [] }

const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true },
  upload: { staticDir: path.resolve(dirname, '../.media') },
  fields: [{ name: 'alt', type: 'text' }],
}

const People: CollectionConfig = {
  slug: 'people',
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text' },
    { name: 'bio', type: 'textarea', localized: true },
  ],
}

const Pages: CollectionConfig = {
  slug: 'pages',
  access: { read: () => true },
  versions: { drafts: true },
  admin: { livePreview: { url: previewURL } },
  fields: [
    { name: 'title', type: 'text', localized: true },
    { name: 'year', type: 'number' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content', // unnamed tab: no data nesting
          fields: [
            { name: 'intro', type: 'textarea', localized: true },
            {
              name: 'team',
              type: 'array',
              fields: [
                { name: 'name', type: 'text' },
                { name: 'role', type: 'text', localized: true },
                { name: 'links', type: 'array', fields: [{ name: 'label', type: 'text' }] },
              ],
            },
          ],
        },
        {
          name: 'seo', // named tab: nests data under "seo"
          fields: [{ name: 'metaTitle', type: 'text' }],
        },
      ],
    },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'sub', type: 'group', fields: [{ name: 'text', type: 'text' }] },
      ],
    },
    {
      type: 'collapsible',
      label: 'CTA',
      fields: [{ type: 'row', fields: [{ name: 'ctaLabel', type: 'text' }] }],
    },
    {
      name: 'localizedItems',
      type: 'array',
      localized: true,
      fields: [{ name: 'label', type: 'text' }],
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [{ slug: 'quote', fields: [{ name: 'quote', type: 'text' }] }],
    },
    { name: 'body', type: 'richText' },
    { name: 'author', type: 'relationship', relationTo: 'people' },
    { name: 'slug', type: 'text' },
  ],
}

const Header: GlobalConfig = {
  slug: 'header',
  access: { read: () => true },
  admin: { livePreview: { url: previewURL } },
  fields: [{ name: 'nav', type: 'array', fields: [{ name: 'label', type: 'text', localized: true }] }],
}

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'visual-editing-dev-secret',
  db: sqliteD1Adapter({ binding: (await getD1()) as any }),
  editor: lexicalEditor(),
  localization: { locales: ['de', 'en'], defaultLocale: 'de', fallback: true },
  admin: {
    user: 'users',
    importMap: { baseDir: dirname },
  },
  collections: [Users, Media, People, Pages],
  globals: [Header],
  plugins: [visualEditingPlugin({ collections: ['pages', 'people'], globals: ['header'] })],
  onInit: seed,
  telemetry: false,
  typescript: { autoGenerate: false },
})
