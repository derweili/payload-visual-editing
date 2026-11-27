/**
 * The plugin against real Payload (Local API, D1 adapter on in-memory Miniflare D1).
 */
import { decodeRef, fieldSourceOf, hasStega, sourceOf, stegaClean, stegaDecode } from '@derweili/payload-visual-editing-core'
import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { createD1, makeConfig, seed } from '../fixtures/config.ts'

let d1: Awaited<ReturnType<typeof createD1>>
let payload: Payload
let pageId: number | string
let personId: number | string

// The characters @vercel/stega encodes with
const ZERO_WIDTH = /[\u200b-\u200d\ufeff]/u
const at = (value: unknown) => decodeRef(stegaDecode(value as string))
const page = (path: string, locale?: string) => ({ collection: 'pages', id: pageId, path, ...(locale ? { locale } : {}) })

beforeAll(async () => {
  d1 = await createD1()
  payload = await getPayload({ config: await makeConfig(d1), key: 'local-api' })
  ;({ pageId, personId } = await seed(payload))
})

const read = (args: Record<string, unknown> = {}) =>
  payload.findByID({ collection: 'pages', id: pageId, locale: 'de', depth: 0, ...args } as any) as Promise<any>
const encoded = (args: Record<string, unknown> = {}) => read({ ...args, context: { encodeSourceMaps: true } })

describe('without the flag', () => {
  it('returns exactly what Payload returns without the plugin', async () => {
    // Same database, read through a Payload without the plugin
    const plain = await getPayload({ config: await makeConfig(d1, { enabled: false }), key: 'no-plugin' })
    const withPlugin = await read({ depth: 1 })
    const withoutPlugin = await plain.findByID({ collection: 'pages', id: pageId, locale: 'de', depth: 1 })
    const normalize = (doc: any) => JSON.stringify({ ...doc, createdAt: 0, updatedAt: 0, author: { ...doc.author, createdAt: 0, updatedAt: 0 }, image: { ...doc.image, createdAt: 0, updatedAt: 0 } })
    expect(normalize(withPlugin)).toBe(normalize(withoutPlugin))
    expect(JSON.stringify(withPlugin)).not.toMatch(ZERO_WIDTH)
  })

  it('ignores a false or non-boolean flag', async () => {
    for (const flag of [false, 'true', 1]) {
      expect(JSON.stringify(await read({ context: { encodeSourceMaps: flag } }))).not.toMatch(ZERO_WIDTH)
    }
  })
})

describe('with context.encodeSourceMaps', () => {
  it('encodes every text field with the right ref', async () => {
    const doc = await encoded()
    expect(at(doc.title)).toEqual(page('title', 'de'))
    expect(at(doc.intro)).toEqual(page('intro', 'de')) // unnamed tab
    expect(at(doc.team[1].name)).toEqual(page('team.1.name'))
    expect(at(doc.team[1].role)).toEqual(page('team.1.role', 'de'))
    expect(at(doc.team[1].links[1].label)).toEqual(page('team.1.links.1.label')) // nested array
    expect(at(doc.seo.metaTitle)).toEqual(page('seo.metaTitle')) // named tab
    expect(at(doc.hero.sub.text)).toEqual(page('hero.sub.text')) // nested group
    expect(at(doc.ctaLabel)).toEqual(page('ctaLabel')) // collapsible + row
    expect(at(doc.localizedItems[1].label)).toEqual(page('localizedItems.1.label', 'de'))
    expect(at(doc.layout[0].quote)).toEqual(page('layout.0.quote')) // blocks
    expect(at(doc.body.root.children[0].children[0].text)).toEqual(page('body')) // Lexical
  })

  it('leaves ids, the default excludes and link URLs alone, and changes no visible text', async () => {
    const doc = await encoded()
    expect(doc.slug).toBe('home')
    expect(hasStega(doc.team[0].id)).toBe(false)
    expect(hasStega(doc.team[0].links[0].id)).toBe(false)
    expect(hasStega(doc.layout[0].id)).toBe(false)
    expect(doc.body.root.children[1].children[0].fields.url).toBe('https://example.com')
    expect(stegaClean(doc)).toEqual(await read())
  })

  it('encodes drafts the same way', async () => {
    await payload.update({ collection: 'pages', id: pageId, locale: 'de', draft: true, data: { title: 'Entwurf' } })
    try {
      const doc = await encoded({ draft: true })
      expect(stegaClean(doc.title)).toBe('Entwurf')
      expect(at(doc.title)).toEqual(page('title', 'de'))
    } finally {
      await payload.update({ collection: 'pages', id: pageId, locale: 'de', data: { title: 'Startseite', _status: 'published' } as any })
    }
  })

  it("locale 'all': every locale value gets its own l", async () => {
    const doc = await encoded({ locale: 'all' })
    expect(at(doc.title.en)).toEqual(page('title', 'en'))
    expect(at(doc.localizedItems.en[0].label)).toEqual(page('localizedItems.0.label', 'en'))
    expect(at(doc.team[0].role.en)).toEqual(page('team.0.role', 'en'))
  })

  it('find encodes every document with its own id', async () => {
    const { docs } = (await payload.find({ collection: 'pages', locale: 'en', depth: 0, context: { encodeSourceMaps: true } })) as any
    expect(at(docs[0].title)).toEqual(page('title', 'en'))
  })

  it('globals', async () => {
    const header = (await payload.findGlobal({ slug: 'header', locale: 'en', context: { encodeSourceMaps: true } })) as any
    expect(at(header.nav[1].label)).toEqual({ global: 'header', path: 'nav.1.label', locale: 'en' })
  })

  it('populated relationships carry their own ref; collections outside the scope stay clean', async () => {
    const doc = await encoded({ depth: 1 })
    expect(at(doc.author.name)).toEqual({ collection: 'people', id: personId, path: 'name' })
    expect(at(doc.author.bio)).toEqual({ collection: 'people', id: personId, path: 'bio', locale: 'de' })
    expect(doc.image.alt).toBe('Ein Bild')
  })

  it('values without stega text carry a source tag: the populated image, the slug, the relation', async () => {
    const doc = await encoded({ depth: 1 })
    expect(sourceOf(doc.image)).toEqual({ collection: 'pages', id: pageId, path: 'image' })
    expect(sourceOf(doc.author)).toEqual({ collection: 'pages', id: pageId, path: 'author' })
    expect(fieldSourceOf(doc, 'slug')).toEqual({ collection: 'pages', id: pageId, path: 'slug' })
    const plain = await payload.findByID({ collection: 'pages', id: pageId, depth: 1 })
    expect(sourceOf(plain.image)).toBeNull()
    expect(fieldSourceOf(plain, 'slug')).toBeNull()
  })
})

describe('writes', () => {
  it('strips encoded text before it is saved', async () => {
    const doc = await encoded()
    await payload.update({ collection: 'pages', id: pageId, locale: 'de', data: { intro: doc.intro, team: doc.team } as any })
    const raw = await read()
    expect(raw.intro).toBe('Willkommen')
    expect(raw.team[1].links[1].label).toBe('Ben 1')
    expect(JSON.stringify(raw)).not.toMatch(ZERO_WIDTH)

    const header = (await payload.findGlobal({ slug: 'header', locale: 'de', context: { encodeSourceMaps: true } })) as any
    await payload.updateGlobal({ slug: 'header', locale: 'de', data: { nav: header.nav } as any })
    expect(JSON.stringify(await payload.findGlobal({ slug: 'header', locale: 'de' }))).not.toMatch(ZERO_WIDTH)
  })
})
