import { describe, expect, it } from 'vitest'

import { appendPath, formatPath, isIndexSegment, parsePath, stripIndices } from './path.ts'

describe('parsePath', () => {
  it.each([
    ['', []],
    ['title', ['title']],
    ['team.2.name', ['team', 2, 'name']],
    ['content.sections.0.items.10.label', ['content', 'sections', 0, 'items', 10, 'label']],
    ['hero.image', ['hero', 'image']],
    ['a0.b1', ['a0', 'b1']],
  ])('parses "%s"', (path, expected) => {
    expect(parsePath(path)).toEqual(expected)
  })

  it('keeps zero-padded segments as names, not indices', () => {
    expect(parsePath('a.01')).toEqual(['a', '01'])
  })

  it.each(['.', 'a..b', '.a', 'a.'])('throws on empty segments in "%s"', (path) => {
    expect(() => parsePath(path)).toThrow(TypeError)
  })
})

describe('formatPath', () => {
  it('joins names and indices', () => {
    expect(formatPath(['team', 2, 'name'])).toBe('team.2.name')
    expect(formatPath([])).toBe('')
  })

  it.each([[['a', -1]], [['a', 1.5]], [['a', Number.NaN]], [['']], [['a.b']]])(
    'rejects invalid segments %o',
    (segments) => {
      expect(() => formatPath(segments)).toThrow(TypeError)
    },
  )

  it('roundtrips with parsePath', () => {
    const path = 'tabs.sections.3.items.0.title'
    expect(formatPath(parsePath(path))).toBe(path)
  })
})

describe('appendPath', () => {
  it('appends to a base path', () => {
    expect(appendPath('team', 2, 'name')).toBe('team.2.name')
    expect(appendPath('team.2', 'links', 0)).toBe('team.2.links.0')
  })

  it('works with an empty base', () => {
    expect(appendPath('', 'title')).toBe('title')
  })
})

describe('stripIndices', () => {
  it('drops numeric segments', () => {
    expect(stripIndices('team.2.links.0.label')).toBe('team.links.label')
    expect(stripIndices('title')).toBe('title')
    expect(stripIndices('')).toBe('')
  })
})

describe('isIndexSegment', () => {
  it('distinguishes indices from names', () => {
    expect(isIndexSegment(0)).toBe(true)
    expect(isIndexSegment('0')).toBe(false)
    expect(isIndexSegment('name')).toBe(false)
  })
})
