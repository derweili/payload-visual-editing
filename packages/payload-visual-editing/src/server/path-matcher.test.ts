import { describe, expect, it } from 'vitest'

import { createPathMatcher } from './path-matcher.ts'

describe('createPathMatcher', () => {
  it('matches a bare field name at any depth', () => {
    const match = createPathMatcher(['slug'])
    expect(match('slug')).toBe(true)
    expect(match('seo.slug')).toBe(true)
    expect(match('team.3.slug')).toBe(true)
    expect(match('slugline')).toBe(false)
    expect(match('slug.title')).toBe(false)
  })

  it('ignores array indices in the path', () => {
    const match = createPathMatcher(['team.links.label'])
    expect(match('team.2.links.0.label')).toBe(true)
    expect(match('team.links.label')).toBe(true)
    expect(match('team.2.links.0.url')).toBe(false)
  })

  it('anchors dotted patterns at the root', () => {
    const match = createPathMatcher(['hero.title'])
    expect(match('hero.title')).toBe(true)
    expect(match('page.hero.title')).toBe(false)
  })

  it('* matches one segment or part of one', () => {
    expect(createPathMatcher(['seo.*'])('seo.metaTitle')).toBe(true)
    expect(createPathMatcher(['seo.*'])('seo.og.title')).toBe(false)
    expect(createPathMatcher(['meta*'])('seo.metaTitle')).toBe(true)
    expect(createPathMatcher(['*.title'])('hero.title')).toBe(true)
  })

  it('** matches any number of segments, also none', () => {
    const match = createPathMatcher(['seo.**'])
    expect(match('seo.metaTitle')).toBe(true)
    expect(match('seo.og.title')).toBe(true)
    expect(createPathMatcher(['**.label'])('label')).toBe(true)
    expect(createPathMatcher(['a.**.z'])('a.z')).toBe(true)
    expect(createPathMatcher(['a.**.z'])('a.b.c.z')).toBe(true)
    expect(createPathMatcher(['a.**.z'])('a.b.c')).toBe(false)
  })

  it('treats regex characters in patterns literally', () => {
    expect(createPathMatcher(['a+b'])('a+b')).toBe(true)
    expect(createPathMatcher(['a+b'])('aab')).toBe(false)
  })

  it('matches nothing without patterns', () => {
    expect(createPathMatcher([])('anything')).toBe(false)
  })
})
