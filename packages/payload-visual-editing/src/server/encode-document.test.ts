import { decodeRef, fieldSourceOf, hasStega, sourceOf, stegaClean, stegaDecode } from '@derweili/payload-visual-editing-core'
import type { FlattenedBlock, FlattenedField } from 'payload'
import { describe, expect, it } from 'vitest'

import { encodeDocument, type EncodeDocumentArgs } from './encode-document.ts'
import { createPathMatcher } from './path-matcher.ts'

// Hand-written flattenedFields: what Payload produces after sanitizing (unnamed tabs, rows and
// collapsibles are already gone). The integration tests cover the real sanitized shapes.
const f = (field: Record<string, unknown>) => field as unknown as FlattenedField

const quoteBlock = { slug: 'quote', fields: [], flattenedFields: [f({ name: 'id', type: 'text' }), f({ name: 'quote', type: 'text' })] } as unknown as FlattenedBlock
const sharedBlock = { slug: 'shared', fields: [], flattenedFields: [f({ name: 'heading', type: 'text' })] } as unknown as FlattenedBlock

const fields: FlattenedField[] = [
  f({ name: 'id', type: 'text' }),
  f({ name: 'title', type: 'text', localized: true }),
  f({ name: 'intro', type: 'textarea' }),
  f({ name: 'slug', type: 'text' }),
  f({ name: 'count', type: 'number' }),
  f({ name: 'kind', type: 'select' }),
  f({ name: 'computed', type: 'text', virtual: 'author.name' }),
  f({
    name: 'team',
    type: 'array',
    flattenedFields: [
      f({ name: 'id', type: 'text' }),
      f({ name: 'name', type: 'text' }),
      f({ name: 'links', type: 'array', flattenedFields: [f({ name: 'id', type: 'text' }), f({ name: 'label', type: 'text' })] }),
    ],
  }),
  f({ name: 'seo', type: 'tab', flattenedFields: [f({ name: 'metaTitle', type: 'text' })] }),
  f({ name: 'hero', type: 'group', flattenedFields: [f({ name: 'sub', type: 'group', flattenedFields: [f({ name: 'text', type: 'text' })] })] }),
  f({ name: 'items', type: 'array', localized: true, flattenedFields: [f({ name: 'label', type: 'text' })] }),
  f({ name: 'layout', type: 'blocks', blocks: [quoteBlock], blockReferences: [quoteBlock, 'shared'] }),
  f({ name: 'body', type: 'richText' }),
  f({ name: 'author', type: 'relationship', relationTo: 'people' }),
]

const lexical = (...texts: string[]) => ({
  root: {
    type: 'root',
    children: [
      { type: 'paragraph', children: texts.map((text) => ({ type: 'text', text })) },
      { type: 'link', fields: { url: 'https://example.com' }, children: [{ type: 'text', text: 'link' }] },
      { type: 'upload', value: { id: 1, alt: 'Alt text' } },
    ],
  },
})

const makeDoc = () => ({
  id: 'abc',
  title: 'Titel',
  intro: 'Intro',
  slug: 'home',
  count: 3,
  kind: 'big',
  computed: 'Jane',
  team: [
    { id: 'row0', name: 'Anna', links: [{ id: 'l0', label: 'A0' }] },
    { id: 'row1', name: 'Ben', links: [{ id: 'l1', label: 'B0' }, { id: 'l2', label: 'B1' }] },
  ],
  seo: { metaTitle: 'Meta' },
  hero: { sub: { text: 'Sub' } },
  items: [{ label: 'Eins' }],
  layout: [
    { id: 'b0', blockType: 'quote', quote: 'Zitat' },
    { id: 'b1', blockType: 'shared', heading: 'Shared' },
    { id: 'b2', blockType: 'unknown', heading: 'Unknown' },
  ],
  body: lexical('Hello ', 'world'),
  author: { id: 7, name: 'Jane' },
})

const encode = (data: Record<string, any>, overrides: Partial<EncodeDocumentArgs> = {}): any => {
  encodeDocument({
    fields,
    data,
    target: { collection: 'pages', id: 'abc' },
    locale: 'de',
    locales: ['de', 'en'],
    skip: false,
    shouldEncodePath: (path) => !createPathMatcher(['slug'])(path),
    resolveBlock: (slug) => (slug === 'shared' ? sharedBlock : undefined),
    ...overrides,
  })
  return data
}

const at = (value: unknown) => decodeRef(stegaDecode(value as string))
const page = (path: string, locale?: string) => ({ collection: 'pages', id: 'abc', path, ...(locale ? { locale } : {}) })

describe('encodeDocument', () => {
  it('encodes text through arrays, nested arrays, named tabs, groups and blocks', () => {
    const doc = encode(makeDoc())
    expect(at(doc.title)).toEqual(page('title', 'de'))
    expect(at(doc.intro)).toEqual(page('intro'))
    expect(at(doc.team[1].name)).toEqual(page('team.1.name'))
    expect(at(doc.team[1].links[1].label)).toEqual(page('team.1.links.1.label'))
    expect(at(doc.seo.metaTitle)).toEqual(page('seo.metaTitle'))
    expect(at(doc.hero.sub.text)).toEqual(page('hero.sub.text'))
    expect(at(doc.items[0].label)).toEqual(page('items.0.label', 'de'))
    expect(at(doc.layout[0].quote)).toEqual(page('layout.0.quote'))
  })

  it('resolves blocks referenced by slug and skips unknown blocks', () => {
    const doc = encode(makeDoc())
    expect(at(doc.layout[1].heading)).toEqual(page('layout.1.heading'))
    expect(doc.layout[2].heading).toBe('Unknown')
  })

  it('never encodes ids, virtual fields, non-text fields, relationships or excluded paths', () => {
    const doc = encode(makeDoc())
    expect(doc.id).toBe('abc')
    expect(doc.team.map((row: any) => row.id)).toEqual(['row0', 'row1'])
    expect(doc.team[1].links.map((row: any) => row.id)).toEqual(['l1', 'l2'])
    expect(doc.layout.map((row: any) => row.id)).toEqual(['b0', 'b1', 'b2'])
    expect(doc.layout[0].blockType).toBe('quote')
    expect(doc.computed).toBe('Jane')
    expect(doc.count).toBe(3)
    expect(doc.kind).toBe('big')
    expect(doc.slug).toBe('home')
    expect(Object.entries(doc.author)).toEqual([['id', 7], ['name', 'Jane']])
  })

  describe('source tags for values without stega text', () => {
    it('numbers, selects and excluded text are tagged on their parent', () => {
      const doc = encode(makeDoc())
      expect(fieldSourceOf(doc, 'count')).toEqual(page('count'))
      expect(fieldSourceOf(doc, 'kind')).toEqual(page('kind'))
      expect(fieldSourceOf(doc, 'slug')).toEqual(page('slug'))
    })

    it('URL-like text that "auto" left unencoded is tagged too', () => {
      const doc = encode({ title: 'https://example.com', slug: 'x' }, { skip: 'auto' })
      expect(hasStega(doc.title)).toBe(false)
      expect(fieldSourceOf(doc, 'title')).toMatchObject({ collection: 'pages', path: 'title' })
    })

    it('a populated relationship becomes a tagged copy; the original stays untouched', () => {
      const author = { id: 7, name: 'Jane' }
      const doc = encode({ ...makeDoc(), author })
      expect(sourceOf(doc.author)).toEqual(page('author'))
      expect(doc.author).not.toBe(author)
      expect(sourceOf(author)).toBeNull()
    })

    it('the same populated document used twice gets one tag per field', () => {
      const shared = { id: 7, name: 'Jane' }
      const fieldsWithTwo = [f({ name: 'author', type: 'relationship' }), f({ name: 'editor', type: 'relationship' })]
      const doc = encode({ author: shared, editor: shared }, { fields: fieldsWithTwo })
      expect(sourceOf(doc.author)?.path).toBe('author')
      expect(sourceOf(doc.editor)?.path).toBe('editor')
    })

    it('hasMany: every populated item is tagged with the field', () => {
      const doc = encode({ gallery: [{ id: 1 }, 2, { id: 3 }] }, { fields: [f({ name: 'gallery', type: 'upload', hasMany: true })] })
      expect(sourceOf(doc.gallery[0])).toEqual(page('gallery'))
      expect(doc.gallery[1]).toBe(2)
      expect(sourceOf(doc.gallery[2])).toEqual(page('gallery'))
    })

    it('inside arrays and groups, with the row path and the locale', () => {
      const fields = [
        f({ name: 'facts', type: 'array', flattenedFields: [f({ name: 'value', type: 'number', localized: true })] }),
        f({ name: 'hero', type: 'group', flattenedFields: [f({ name: 'image', type: 'upload' })] }),
      ]
      const doc = encode({ facts: [{ value: 1 }, { value: 2 }], hero: { image: { id: 9 } } }, { fields, locale: 'de' })
      expect(fieldSourceOf(doc.facts[1], 'value')).toEqual(page('facts.1.value', 'de'))
      expect(sourceOf(doc.hero.image)).toEqual(page('hero.image'))
    })

    it('encoded text, ids, containers, richText and empty values get no tag', () => {
      const doc = encode({ ...makeDoc(), count: null })
      for (const name of ['title', 'id', 'team', 'hero', 'layout', 'body', 'count']) {
        expect(fieldSourceOf(doc, name)).toBeNull()
      }
    })
  })

  it('encodes Lexical text nodes with the field ref and leaves node data alone', () => {
    const doc = encode(makeDoc())
    const [paragraph, link, upload] = doc.body.root.children as any[]
    expect(at(paragraph.children[0].text)).toEqual(page('body'))
    expect(at(paragraph.children[1].text)).toEqual(page('body'))
    expect(at(link.children[0].text)).toEqual(page('body'))
    expect(link.fields.url).toBe('https://example.com')
    expect(upload.value).toEqual({ id: 1, alt: 'Alt text' })
  })

  it('changes nothing but appended hidden characters', () => {
    const doc = encode(makeDoc())
    expect(stegaClean(doc)).toEqual(makeDoc())
  })

  it("locale 'all': every locale value gets its own l", () => {
    const doc = encode(
      { ...makeDoc(), title: { de: 'Titel', en: 'Title' }, items: { de: [{ label: 'Eins' }], en: [{ label: 'One' }, { label: 'Two' }] } },
      { locale: 'all' },
    ) as any
    expect(at(doc.title.de)).toEqual(page('title', 'de'))
    expect(at(doc.title.en)).toEqual(page('title', 'en'))
    expect(at(doc.items.en[1].label)).toEqual(page('items.1.label', 'en'))
    expect(at(doc.team[0].name)).toEqual(page('team.0.name'))
  })

  it("locale 'all': ignores locale keys that aren't configured", () => {
    const doc = encode({ title: { de: 'Titel', xx: 'Other' } }, { locale: 'all' }) as any
    expect(doc.title.xx).toBe('Other')
  })

  it('without localization no ref has a locale', () => {
    const doc = encode(makeDoc(), { locale: undefined, locales: null })
    expect(at(doc.title)).toEqual(page('title'))
  })

  it('uses the global as target', () => {
    const doc = encode(makeDoc(), { target: { global: 'header' } })
    expect(at(doc.intro)).toEqual({ global: 'header', path: 'intro' })
  })

  it('respects the skip mode', () => {
    const auto = encode({ intro: 'https://example.com', title: 'Hinweis: Text' }, { skip: 'auto' })
    expect(auto.intro).toBe('https://example.com')
    expect(hasStega(auto.title)).toBe(true) // prose with a colon is not a URL
    const always = encode({ intro: 'https://example.com' }, { skip: false })
    expect(hasStega(always.intro as string)).toBe(true)
  })

  it('applies shouldEncodePath to text and richText', () => {
    const doc = encode(makeDoc(), { shouldEncodePath: (path) => !path.startsWith('body') && !path.startsWith('team') })
    expect(hasStega(doc.title)).toBe(true)
    expect(doc.team[0].name).toBe('Anna')
    expect((doc.body.root.children as any[])[0].children[0].text).toBe('Hello ')
  })

  it('tolerates null, missing and malformed values', () => {
    const doc = encode({ title: null, team: [null, 'x', { name: null }], hero: 'x', layout: [{ blockType: 1 }], body: { root: 'x' } })
    expect(doc).toEqual({ title: null, team: [null, 'x', { name: null }], hero: 'x', layout: [{ blockType: 1 }], body: { root: 'x' } })
  })
})
