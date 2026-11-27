import { describe, expect, it } from 'vitest'

import { resolveFocus, type FieldLike } from './resolve-focus.ts'

// Shaped like the fixture's Pages collection (test/fixtures/config.ts) as the client config has it
const text = (name: string): FieldLike => ({ type: 'text', name })
const fields: FieldLike[] = [
  text('title'),
  {
    type: 'tabs',
    tabs: [
      {
        fields: [
          { type: 'textarea', name: 'intro' },
          {
            type: 'array',
            name: 'team',
            fields: [text('name'), text('role'), { type: 'array', name: 'links', fields: [text('label')] }],
          },
        ],
      },
      { name: 'seo', fields: [text('metaTitle')] },
    ],
  },
  { type: 'group', name: 'hero', fields: [text('heading'), { type: 'group', name: 'sub', fields: [text('text')] }] },
  { type: 'collapsible', fields: [{ type: 'row', fields: [text('ctaLabel')] }] },
  {
    type: 'blocks',
    name: 'layout',
    blocks: [{ slug: 'quote', fields: [text('quote'), text('author')] }],
    blockReferences: ['cta', { slug: 'quote', fields: [text('quote'), text('author')] }],
  },
  { type: 'richText', name: 'body' },
  {
    type: 'row',
    fields: [
      {
        type: 'tabs',
        tabs: [
          { fields: [text('a')] },
          { fields: [{ type: 'tabs', tabs: [{ fields: [text('b')] }, { fields: [text('c')] }] }] },
        ],
      },
    ],
  },
]
const blocksMap = { cta: { slug: 'cta', fields: [text('buttonLabel')] } }
const blockTypes: Record<string, string> = { 'layout.0': 'quote', 'layout.1': 'cta' }
const resolve = (path: string) => resolveFocus(fields, path, { blocksMap, getBlockType: (row) => blockTypes[row] })

describe('resolveFocus', () => {
  it('top-level field: no steps', () => {
    expect(resolve('title')).toEqual({ path: 'title', steps: [] })
  })

  it('field in an unnamed tab', () => {
    expect(resolve('intro')?.steps).toEqual([{ type: 'tab', ordinal: 0, index: 0 }])
  })

  it('field in a named tab', () => {
    expect(resolve('seo.metaTitle')?.steps).toEqual([{ type: 'tab', ordinal: 0, index: 1 }])
  })

  it('nested arrays in a tab: tab, then each row', () => {
    expect(resolve('team.1.links.0.label')).toEqual({
      path: 'team.1.links.0.label',
      steps: [
        { type: 'tab', ordinal: 0, index: 0 },
        { type: 'row', path: 'team', index: 1 },
        { type: 'row', path: 'team.1.links', index: 0 },
      ],
    })
  })

  it('a path that ends at a row or the array itself', () => {
    expect(resolve('team.1')?.steps.at(-1)).toEqual({ type: 'row', path: 'team', index: 1 })
    expect(resolve('team')?.steps).toEqual([{ type: 'tab', ordinal: 0, index: 0 }])
  })

  it('groups, collapsibles and rows add no steps', () => {
    expect(resolve('hero.sub.text')?.steps).toEqual([])
    expect(resolve('ctaLabel')?.steps).toEqual([])
  })

  it('blocks: picks the block by its blockType, also referenced blocks', () => {
    expect(resolve('layout.0.author')?.steps).toEqual([{ type: 'row', path: 'layout', index: 0 }])
    expect(resolve('layout.1.buttonLabel')?.steps).toEqual([{ type: 'row', path: 'layout', index: 1 }])
    expect(resolve('layout.1.author')).toBeNull() // not a field of the cta block
    expect(resolve('layout.5.author')).toBeNull() // unknown row
  })

  it('richText is a target like any field', () => {
    expect(resolve('body')).toEqual({ path: 'body', steps: [] })
  })

  it('counts tabs fields per scope: inside a row, and nested in a tab', () => {
    // The second tabs field of the form (the first sits before it at the top level)
    expect(resolve('a')?.steps).toEqual([{ type: 'tab', ordinal: 1, index: 0 }])
    expect(resolve('c')?.steps).toEqual([
      { type: 'tab', ordinal: 1, index: 1 },
      { type: 'tab', ordinal: 0, index: 1 },
    ])
  })

  it('tabs inside an array row get no ordinal', () => {
    const inRow: FieldLike[] = [
      { type: 'array', name: 'items', fields: [{ type: 'tabs', tabs: [{ fields: [] }, { fields: [text('x')] }] }] },
    ]
    expect(resolveFocus(inRow, 'items.0.x')?.steps).toEqual([
      { type: 'row', path: 'items', index: 0 },
      { type: 'tab', ordinal: null, index: 1 },
    ])
  })

  it('unknown or malformed paths resolve to null', () => {
    for (const path of ['', 'nope', 'title.x', 'team.x.name', 'hero', 'seo.nope']) expect(resolve(path)).toBeNull()
  })
})
