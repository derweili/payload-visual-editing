import { describe, expect, it } from 'vitest'

import { decodeRef, encodeRef, isSourceRef, type SourceLocation } from './ref.ts'

describe('encodeRef', () => {
  it('encodes a collection location with short keys', () => {
    expect(encodeRef({ collection: 'pages', id: 'abc', path: 'team.2.name', locale: 'de' })).toEqual(
      { o: 'pve', v: 1, c: 'pages', id: 'abc', p: 'team.2.name', l: 'de' },
    )
  })

  it('encodes a global location with g instead of c + id', () => {
    expect(encodeRef({ global: 'header', path: 'nav.0.label' })).toEqual({
      o: 'pve',
      v: 1,
      g: 'header',
      p: 'nav.0.label',
    })
  })

  it('keeps numeric ids and an optional href', () => {
    expect(encodeRef({ collection: 'projects', id: 7, path: 'title', href: '/admin/x' })).toEqual({
      o: 'pve',
      v: 1,
      c: 'projects',
      id: 7,
      p: 'title',
      href: '/admin/x',
    })
  })

  it('omits empty locale and href', () => {
    const ref = encodeRef({ collection: 'pages', id: 1, path: 'title', locale: '', href: '' })
    expect(ref).not.toHaveProperty('l')
    expect(ref).not.toHaveProperty('href')
  })
})

describe('decodeRef', () => {
  const locations: SourceLocation[] = [
    { collection: 'pages', id: 'abc', path: 'team.2.name', locale: 'de' },
    { collection: 'projects', id: 0, path: '' },
    { global: 'header', path: 'nav.0.label', locale: 'en', href: 'https://cms/admin' },
  ]

  it.each(locations)('roundtrips %o', (location) => {
    expect(decodeRef(encodeRef(location))).toEqual(location)
  })

  it.each([
    ['null', null],
    ['a string', 'pve'],
    ['a foreign origin', { o: 'vercel', v: 1, c: 'pages', id: 1, p: 'x' }],
    ['another version', { o: 'pve', v: 2, c: 'pages', id: 1, p: 'x' }],
    ['a missing path', { o: 'pve', v: 1, c: 'pages', id: 1 }],
    ['a collection without id', { o: 'pve', v: 1, c: 'pages', p: 'x' }],
    ['an id without collection', { o: 'pve', v: 1, id: 1, p: 'x' }],
    ['both collection and global', { o: 'pve', v: 1, c: 'pages', id: 1, g: 'header', p: 'x' }],
    ['neither collection nor global', { o: 'pve', v: 1, p: 'x' }],
    ['an empty global', { o: 'pve', v: 1, g: '', p: 'x' }],
    ['an empty id', { o: 'pve', v: 1, c: 'pages', id: '', p: 'x' }],
    ['a NaN id', { o: 'pve', v: 1, c: 'pages', id: Number.NaN, p: 'x' }],
    ['a non-string locale', { o: 'pve', v: 1, g: 'header', p: 'x', l: 1 }],
    ['an empty href', { o: 'pve', v: 1, g: 'header', p: 'x', href: '' }],
  ])('returns null for %s', (_label, value) => {
    expect(decodeRef(value)).toBeNull()
    expect(isSourceRef(value)).toBe(false)
  })
})

describe('isSourceRef', () => {
  it('accepts refs created by encodeRef', () => {
    expect(isSourceRef(encodeRef({ global: 'footer', path: 'copyright' }))).toBe(true)
    expect(isSourceRef(encodeRef({ collection: 'pages', id: 'x', path: 'a' }))).toBe(true)
  })
})
