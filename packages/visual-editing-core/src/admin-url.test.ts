import { describe, expect, it } from 'vitest'

import { buildAdminUrl } from './admin-url.ts'
import { encodeRef } from './ref.ts'

describe('buildAdminUrl', () => {
  it('builds a collection deep link', () => {
    expect(buildAdminUrl({ collection: 'pages', id: 'abc', path: 'team.2.name' })).toBe(
      '/admin/collections/pages/abc?field=team.2.name',
    )
  })

  it('builds a global deep link', () => {
    expect(buildAdminUrl({ global: 'header', path: 'nav.0.label' })).toBe(
      '/admin/globals/header?field=nav.0.label',
    )
  })

  it('adds the locale', () => {
    expect(buildAdminUrl({ collection: 'projects', id: 7, path: 'title', locale: 'de' })).toBe(
      '/admin/collections/projects/7?field=title&locale=de',
    )
  })

  it('omits the field param for an empty path', () => {
    expect(buildAdminUrl({ global: 'header', path: '' })).toBe('/admin/globals/header')
    expect(buildAdminUrl({ global: 'header', path: '', locale: 'en' })).toBe(
      '/admin/globals/header?locale=en',
    )
  })

  it.each([
    ['/cms', '/cms/globals/header?field=x'],
    ['cms/', '/cms/globals/header?field=x'],
    ['/nested/admin/', '/nested/admin/globals/header?field=x'],
    ['/', '/globals/header?field=x'],
  ])('uses the custom admin route "%s"', (adminRoute, expected) => {
    expect(buildAdminUrl({ global: 'header', path: 'x' }, { adminRoute })).toBe(expected)
  })

  it('builds an absolute URL with serverURL', () => {
    expect(
      buildAdminUrl({ global: 'header', path: 'x' }, { serverURL: 'https://cms.example.com/' }),
    ).toBe('https://cms.example.com/admin/globals/header?field=x')
  })

  it('escapes slugs and ids', () => {
    expect(buildAdminUrl({ collection: 'my pages', id: 'a/b?c', path: 'x' })).toBe(
      '/admin/collections/my%20pages/a%2Fb%3Fc?field=x',
    )
  })

  it('accepts a wire SourceRef', () => {
    const ref = encodeRef({ collection: 'pages', id: 1, path: 'hero.title', locale: 'en' })
    expect(buildAdminUrl(ref)).toBe('/admin/collections/pages/1?field=hero.title&locale=en')
  })

  it('throws on an invalid wire ref', () => {
    expect(() => buildAdminUrl({ o: 'pve', v: 2, g: 'x', p: '' } as never)).toThrow(TypeError)
  })
})
