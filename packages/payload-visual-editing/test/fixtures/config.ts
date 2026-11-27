/**
 * Integration test fixtures: every field shape the plugin supports (named and unnamed tabs, arrays in tabs,
 * nested arrays, groups, collapsible + row, blocks, localized fields, Lexical, a relationship,
 * a localized global), on Payload's D1 adapter with an in-memory Miniflare D1.
 */
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { convertV4MiniflareOptions, Miniflare } from 'miniflare'
import { buildConfig, type CollectionConfig, type Config, type GlobalConfig } from 'payload'

import { visualEditingPlugin, type VisualEditingPluginOptions } from '../../src/server/index.ts'

export const People: CollectionConfig = {
  slug: 'people',
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text' },
    { name: 'bio', type: 'textarea', localized: true },
  ],
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: { read: () => true },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', localized: true },
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
    { name: 'image', type: 'relationship', relationTo: 'media' },
    { name: 'slug', type: 'text' },
  ],
}

export const Header: GlobalConfig = {
  slug: 'header',
  fields: [{ name: 'nav', type: 'array', fields: [{ name: 'label', type: 'text', localized: true }] }],
}

export const Users: CollectionConfig = { slug: 'users', auth: true, fields: [] }

/** Not in the plugin scope: populated media must stay clean. */
export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true },
  fields: [{ name: 'alt', type: 'text' }],
}

/** Default plugin scope for the tests; `media` stays out (like images in a real site). */
export const pluginOptions: VisualEditingPluginOptions = {
  collections: ['pages', 'people'],
  globals: ['header'],
}

/**
 * An in-memory D1. Share one per test file: Payload skips the schema push when it already pushed
 * the same schema in this process, so a second fresh database would stay empty.
 */
export async function createD1() {
  // Miniflare 5 beta (wrangler's version) still accepts the v4 option shape through this converter.
  // No persistence options: the database lives in memory.
  const miniflare = new Miniflare(
    convertV4MiniflareOptions({
      modules: true,
      script: 'export default { fetch: () => new Response(null) }',
      d1Databases: ['D1'],
    }),
  )
  return miniflare.getD1Database('D1')
}

export async function makeConfig(
  d1: Awaited<ReturnType<typeof createD1>>,
  options: VisualEditingPluginOptions = pluginOptions,
) {
  return buildConfig({
      secret: 'test-secret',
      db: sqliteD1Adapter({ binding: d1 as any }),
      editor: lexicalEditor(),
      localization: { locales: ['de', 'en'], defaultLocale: 'de', fallback: true },
      admin: { user: 'users' },
      collections: [Users, People, Media, Pages],
      globals: [Header],
      plugins: [visualEditingPlugin(options)],
      telemetry: false,
  })
}

/** A Lexical document with two paragraphs and a link. */
export const lexicalBody = {
  root: {
    type: 'root',
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children: [
      {
        type: 'paragraph',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        children: [
          { type: 'text', version: 1, text: 'Hello ', format: 0, detail: 0, mode: 'normal', style: '' },
          { type: 'text', version: 1, text: 'world', format: 1, detail: 0, mode: 'normal', style: '' },
        ],
      },
      {
        type: 'paragraph',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        children: [
          {
            type: 'link',
            version: 3,
            direction: 'ltr',
            format: '',
            indent: 0,
            fields: { linkType: 'custom', url: 'https://example.com', newTab: false },
            children: [{ type: 'text', version: 1, text: 'a link', format: 0, detail: 0, mode: 'normal', style: '' }],
          },
        ],
      },
    ],
  },
}

export async function seed(payload: import('payload').Payload) {
  const person = await payload.create({
    collection: 'people',
    locale: 'de',
    data: { name: 'Jane Doe', bio: 'Architektin' },
  })
  await payload.update({ collection: 'people', id: person.id, locale: 'en', data: { bio: 'Architect' } })

  const media = await payload.create({ collection: 'media', data: { alt: 'Ein Bild' } })

  const page = await payload.create({
    collection: 'pages',
    locale: 'de',
    draft: false,
    data: {
      _status: 'published',
      title: 'Startseite',
      intro: 'Willkommen',
      team: [
        { name: 'Anna', role: 'Leitung', links: [{ label: 'Anna LinkedIn' }] },
        { name: 'Ben', role: 'Planung', links: [{ label: 'Ben 0' }, { label: 'Ben 1' }] },
      ],
      seo: { metaTitle: 'Meta DE' },
      hero: { heading: 'Hero', sub: { text: 'Sub' } },
      ctaLabel: 'Kontakt',
      localizedItems: [{ label: 'DE eins' }, { label: 'DE zwei' }],
      layout: [{ blockType: 'quote', quote: 'Zitat' }],
      body: lexicalBody,
      author: person.id,
      image: media.id,
      slug: 'home',
    } as any,
  })
  // English values; array rows are shared (team is not localized), role is localized per row
  const de = (await payload.findByID({ collection: 'pages', id: page.id, locale: 'de', depth: 0 })) as any
  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    data: {
      title: 'Home',
      intro: 'Welcome',
      team: de.team.map((row: any, i: number) => ({ ...row, role: ['Lead', 'Planning'][i] })),
      localizedItems: [{ label: 'EN one' }],
    } as any,
  })
  await payload.updateGlobal({ slug: 'header', locale: 'de', data: { nav: [{ label: 'Projekte' }, { label: 'Über uns' }] } as any })
  const header = (await payload.findGlobal({ slug: 'header', locale: 'de' })) as any
  await payload.updateGlobal({
    slug: 'header',
    locale: 'en',
    data: { nav: header.nav.map((row: any, i: number) => ({ ...row, label: ['Projects', 'About'][i] })) } as any,
  })
  return { pageId: page.id, personId: person.id, mediaId: media.id }
}
