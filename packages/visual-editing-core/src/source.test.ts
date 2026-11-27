import { describe, expect, it } from 'vitest'

import { fieldSourceOf, setFieldSource, sourceOf, withSource } from './source.ts'

const source = { collection: 'projects', id: 1, path: 'gallery.0.media.image' }

describe('source tags', () => {
  it('withSource tags a copy and leaves the original alone', () => {
    const media = { id: 5, url: '/a.jpg' }
    const tagged = withSource(media, source)
    expect(sourceOf(tagged)).toEqual(source)
    expect(sourceOf(media)).toBeNull()
    expect(Object.entries(tagged)).toEqual(Object.entries(media)) // same visible data
  })

  it('tags are invisible to JSON, Object.keys and spreading', () => {
    const tagged = withSource({ url: '/a.jpg' }, source)
    const parent = { year: 2021 }
    setFieldSource(parent, 'year', { ...source, path: 'year' })
    expect(JSON.stringify(tagged)).toBe('{"url":"/a.jpg"}')
    expect(Object.keys(parent)).toEqual(['year'])
    expect(sourceOf({ ...tagged })).toEqual(source) // spreading copies own symbols…
    expect(JSON.parse(JSON.stringify(tagged))).toEqual({ url: '/a.jpg' }) // …serializing doesn't
  })

  it('field sources by name, several per parent', () => {
    const parent = {}
    setFieldSource(parent, 'year', { ...source, path: 'year' })
    setFieldSource(parent, 'startYear', { ...source, path: 'startYear' })
    expect(fieldSourceOf(parent, 'year')?.path).toBe('year')
    expect(fieldSourceOf(parent, 'startYear')?.path).toBe('startYear')
    expect(fieldSourceOf(parent, 'nope')).toBeNull()
  })

  it('anything untagged gives null', () => {
    for (const value of [null, undefined, 1, 'x', {}, []]) {
      expect(sourceOf(value)).toBeNull()
      expect(fieldSourceOf(value, 'x')).toBeNull()
    }
  })
})
